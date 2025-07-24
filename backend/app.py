from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_pymongo import PyMongo
from bson import ObjectId
from datetime import datetime
import os, requests
from sentence_transformers import SentenceTransformer
from utils.pdf_parser  import extract_text_from_pdf, split_by_sections
from utils.chunker     import hybrid_chunk_sections
from utils.vectorstore import add_chunks_to_store, collection 

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# ─── MongoDB setup ────────────────────────────────────────────────

app.config["MONGO_URI"] = os.getenv("DB_URI")
mongo = PyMongo(app)    

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    return response

# ─── Upload + Persist Metadata & Chat ─────────────────────────────
UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route("/upload", methods=["OPTIONS","POST"])
def upload_file():
    if request.method == "OPTIONS":
        return ("", 204)

    try:
        file    = request.files["file"]
        user_id = request.form["userId"]
        filename  = secure_filename(file.filename)
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(save_path)

        #Extract & vectorize
        raw_text = extract_text_from_pdf(save_path)
        sections = split_by_sections(raw_text)
        chunks   = hybrid_chunk_sections(sections)

        #print("Chunking results: sample chunks extracted from a document:")
        #for idx, c in enumerate(chunks[:5]):
            #print(f"{idx + 1}. [Section: {c['section']}, Index: {c['chunk_index']}]\n{c['text'][:200]}...")
        #print("\n" + "=" * 50 + "\n")
        #add_chunks_to_store(chunks, user_id, filename)


        #Persist Document metadata
        doc_entry = {
            "user_id":     user_id,
            "filename":    filename,
            "path":        save_path,
            "upload_date": datetime.utcnow()
        }
        doc_result = mongo.db.documents.insert_one(doc_entry)
        document_id = doc_result.inserted_id
        add_chunks_to_store(chunks, user_id, filename, document_id)

        #Create an empty Chat
        chat_entry = {
            "user_id":     user_id,
            "document_id": document_id,
            "messages":    []    
        }
        chat_result = mongo.db.chats.insert_one(chat_entry)
        chat_id = chat_result.inserted_id

        #Return both vector stats and new IDs
        return jsonify({
            "message":        "File received and vectorized.",
            "chunksInserted": len(chunks),
            "documentId":     str(document_id),
            "chatId":         str(chat_id)
        }), 200

    except Exception as e:
        app.logger.exception("upload failed")
        return jsonify({"error": str(e)}), 500


# ─── Retrieval + Persist Chat History ──────────────────────────────
embed_model     = SentenceTransformer("all-MiniLM-L6-v2")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")   

@app.route("/query", methods=["POST"])
def query_and_persist():
    data     = request.get_json(force=True)
    user_id  = data.get("userId")
    chat_id  = data.get("chatId")
    question = data.get("query")
    document_id = data.get("documentId")
    if not user_id or not chat_id or not question or not document_id:
        return jsonify({"error": "Missing userId, chatId, query, or documentId"}), 400

    #Record user message in Mongo
    mongo.db.chats.update_one(
        { "_id": ObjectId(chat_id) },
        { "$push": { "messages": {
            "role": "user",
            "text": question,
            "timestamp": datetime.utcnow()
        }}}
    )

    #Embed & retrieve
    q_emb = embed_model.encode([question], show_progress_bar=False).tolist()[0]
   
    results = collection.query(
    query_embeddings=[q_emb],
    n_results=5,
    where={
      "$and": [
        { "user_id":     { "$eq": user_id     } },
        { "document_id": { "$eq": document_id } }
      ]
    }
    )

    #print("Embedding representation: each chunk and question vectorized with SentenceTransformer.")
    #print(f"Question vector (first 10 dims): {q_emb[:10]}")
    #print("\n" + "=" * 50 + "\n")


    print("Retrieved docs:", results["documents"][0])

    #docs = results["documents"][0]
    #print("Retrieval: top-3 chunks returned for the sample query:")
    #for rank, doc_text in enumerate(docs[:3], start=1):
        #print(f"{rank}. {doc_text[:200]}...")
    #print("\n" + "=" * 50 + "\n")


    docs = results["documents"][0]

    prompt = (
        "You are a helpful assistant. Answer the question using the snippets below. "
        "When you respond, omit all markdown formatting (no **bold**, no *italics*) "
        "and remove any in‑text citations or parenthetical references.\n\n"
        "CONTEXT:\n"
        + "\n---\n".join(docs)
        + f"\n\nQUESTION: {question}\n\n"
        "Answer concisely:"
    )


    print("Prompt assembly: how context and question are passed to Mistral:\n")
    print(prompt)

    resp = requests.post(
        "https://api.mistral.ai/v1/chat/completions",
        headers={
          "Authorization": f"Bearer {MISTRAL_API_KEY}",
          "Content-Type":  "application/json"
        },
        json={
          "model":       "mistral-small-2506",
          "messages":    [{"role": "user", "content": prompt}],
          "temperature": 0.0
        }
    )
    resp.raise_for_status()
    answer = resp.json()["choices"][0]["message"]["content"].strip()

    #Record assistant message in Mongo
    mongo.db.chats.update_one(
        { "_id": ObjectId(chat_id) },
        { "$push": { "messages": {
            "role": "assistant",
            "text": answer,
            "timestamp": datetime.utcnow()
        }}}
    )

    return jsonify({"answer": answer}), 200



@app.route("/chats", methods=["GET"])
def list_chats():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400

    chats = []
    for c in mongo.db.chats.find({"user_id": user_id}).sort("messages.timestamp", 1):
        doc = mongo.db.documents.find_one({"_id": c["document_id"]})
        chats.append({
            "chatId":     str(c["_id"]),
            "documentId": str(c["document_id"]),
            "documentName": doc["filename"],
            "messages":   c["messages"]
        })
    return jsonify(chats), 200



@app.route("/documents/<document_id>", methods=["DELETE"])
def delete_document(document_id):
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400

    doc = mongo.db.documents.find_one({
        "_id": ObjectId(document_id),
        "user_id": user_id
    })
    if not doc:
        return abort(404, description="Document not found")
    try:
        collection.delete(
            where={
                "$and": [
                    {"user_id":   {"$eq": user_id}},
                    {"document_id": {"$eq": str(document_id)}}
                ]
            }
        )
    except Exception as e:
        app.logger.warning(f"Could not delete vectors: {e}")

    mongo.db.documents.delete_one({"_id": ObjectId(document_id)})
    mongo.db.chats.delete_many({"document_id": ObjectId(document_id)})

    try:
        os.remove(doc["path"])
    except OSError as e:
        app.logger.warning(f"Could not delete file: {e}")

    return jsonify({"message": "Document and all associated data deleted"}), 200

if __name__ == "__main__":
   app.run(debug=True, port=5000)
