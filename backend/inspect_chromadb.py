from chromadb import PersistentClient

# 1) connect
client     = PersistentClient(path="./chromadb")
collection = client.get_collection("documents")  # or whatever name you used

# 2) count your chunks
print("Total chunks:", collection.count())

# 3) peek at the first few entries
results = collection.get(
    limit=3,
    include=["documents", "metadatas"]
)
for doc, meta in zip(results["documents"], results["metadatas"]):
    print(f"- {meta['filename']} (section {meta['section']} chunk {meta['chunk_index']})")
    print("   ", doc[:80].replace("\n"," "), "…")
