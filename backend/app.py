# backend/app.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename
# backend/app.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os, requests
from sentence_transformers import SentenceTransformer
from chromadb import PersistentClient
from utils.vectorstore import client, collection

# your ingestion utils
from utils.pdf_parser    import extract_text_from_pdf, split_by_sections
from utils.chunker       import hybrid_chunk_sections
from utils.vectorstore   import add_chunks_to_store

app = Flask(__name__)
CORS(app)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    return response


# ─── Upload setup ────────────────────────────────────────────────
UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route("/upload", methods=["OPTIONS","POST"])
def upload_file():
    # 1) Handle the preflight
    if request.method == "OPTIONS":
        return ("", 204)

    try:
        # 2) Normal POST logic
        file    = request.files["file"]
        user_id = request.form["userId"]
        filename  = secure_filename(file.filename)
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(save_path)

        raw_text = extract_text_from_pdf(save_path)
        sections = split_by_sections(raw_text)
        chunks   = hybrid_chunk_sections(sections)
        add_chunks_to_store(chunks, user_id, filename)

        # 3) Return here—chunks is guaranteed to exist
        return jsonify({
            "message":        "File received and vectorized.",
            "chunksInserted": len(chunks)
        }), 200

    except Exception as e:
        # 4) Always return JSON on errors so your front‑end sees proper JSON
        app.logger.exception("upload failed")
        return jsonify({"error": str(e)}), 500


# ─── Retrieval + Mistral setup ────────────────────────────────────
#CHROMA_DIR      = os.getenv("CHROMA_DIR", "./chromadb")
MISTRAL_API_KEY = "GKlxOsrGhhJ1ku7P8c8e9TfF3uK0GdVm"
#client          = PersistentClient(path=CHROMA_DIR)
#collection      = client.get_collection("documents")
embed_model     = SentenceTransformer("all-MiniLM-L6-v2")

@app.route("/query", methods=["POST"])
def query_and_print():
    data     = request.get_json(force=True)
    user_id  = data.get("userId")
    question = data.get("query")
    if not user_id or not question:
        return jsonify({"error": "Missing userId or query"}), 400

    # 1) Embed
    q_emb = embed_model.encode([question], show_progress_bar=False).tolist()[0]

    # 2) Retrieve top‑5 chunks for that user
    results = collection.query(
        query_embeddings=[q_emb],
        n_results=5,
        where={"user_id": user_id}
    )
    docs      = results["documents"][0]
    metadatas = results["metadatas"][0]

    # 3) Build prompt
    prompt = (
        "You are a helpful assistant. Use the following snippets to answer the question.\n\n"
        "CONTEXT:\n"
        + "\n---\n".join(docs)
        + f"\n\nQUESTION: {question}\n\nAnswer concisely:"
    )

    # prompt = (
    #     "You are a helpful assistant.\n"
    #     "If the user’s input is just a greeting (e.g. “hi”, “hello”), respond with a friendly greeting and ask how you can help.\n"
    #     "Otherwise, use the following snippets to answer the question:\n\n"
    #     "CONTEXT:\n"
    #     + "\n---\n".join(docs)
    #     + f"\n\nQUESTION: {question}\n\nAnswer concisely:"
    #     )


    # 4) Call Mistral
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

    # 5) Print to your server console
    app.logger.info(f"Mistral answer: {answer}")
    #—or simply: print(answer)

    # 6) Return minimal status to client
    return jsonify({"answer": answer}), 200

if __name__ == "__main__":
    # disable the auto‑reloader on Windows to avoid WinError 10038
    app.run(debug=True, use_reloader=False, port=5000)


