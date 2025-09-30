import os
from typing import List
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "Book_recommend"

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
books_col = db["books"]

app = Flask(__name__)

vectorize = None
matrix = None
id_list = []

def build_matrix():
    global vectorize, matrix, id_list
    docs = []
    id_list = []
    for b in books_col.find({}, {"_id": 1, "title": 1, "author": 1, "genres": 1, "description": 1}):
        id_list.append(str(b["_id"]))
        genres = " ".join((b.get("genres") or []))
        text = f"{b.get('title','')} {b.get('author','')} {genres} {b.get('description','')}"
        docs.append(text)

    if not docs:
        vectorize = TfidfVectorizer(stop_words='english')
        matrix = vectorize.fit_transform([""])
    else:
        vectorize = TfidfVectorizer(stop_words='english', max_features=20000)
        matrix = vectorize.fit_transform(docs)


def on_startup():
    build_matrix()

@app.route("/similar", methods=["POST"])
def similar():
    global matrix, vectorize, id_list
    if matrix is None or vectorize is None:
        build_matrix()

    data = request.get_json()
    book_id = data.get("book_id", [])
    top_n = data.get("top_n", 10)

    index_map = {bid: i for i, bid in enumerate(id_list)}
    seed_idx = [index_map[bid] for bid in book_id if bid in index_map]
    if not seed_idx:
        return jsonify({"similar": []})

    import numpy as np
    seed_vec = matrix[seed_idx].mean(axis=0)
    sims = cosine_similarity(np.asarray(seed_vec).reshape(1,-1),np.asarray(matrix.todense())).flatten()

    seed_set = set(seed_idx)
    ranked = [
        (i, float(sims[i])) for i in sims.argsort()[::-1]
        if i not in seed_set
    ]

    top = [
        {"book_id": id_list[i], "score": score}
        for i, score in ranked[:top_n]
    ]
    return jsonify({"similar": top})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000,debug=True)