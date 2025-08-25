import os
from typing import List
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "Book_recommend"

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
books_col = db["books"]

app = FastAPI(title= "Book ML service")

vectorize = None
matrix  = None
id_list:List[str] = []

def build_matrix():
    global vectorize, matrix, id_list
    docs = []
    id_list = []
    for b in books_col.find({},{"_id":1,"title":1,"author":1,"genres":1,"description":1}):
        id_list.append(str(b["_id"]))
        genres = " ".join((b.get("genres") or []))
        text = f"{b.get('title','')} {b.get('author','')} {genres} {b.get('description','')}"
        docs.append(text)

    if not docs:
        vectorize=TfidfVectorizer(stop_words='english')
        matrix = vectorize.fit_transform([""])
    else:
        vectorize=TfidfVectorizer(stop_words='english',max_features=20000)
        matrix = vectorize.fit_transform(docs)

class SimilarRequest(BaseModel):
    book_id: List[str]
    top_n: int = 10

@app.on_event("startup")
def on_startup():
    # ✅ just build the matrix at startup
    build_matrix()

@app.post("/similar")
def similar(req: SimilarRequest):
    # ✅ now this is a proper endpoint with request body
    global matrix, vectorize, id_list

    if matrix is None or vectorize is None:
        build_matrix()

    index_map = {bid: i for i, bid in enumerate(id_list)}
    seed_idx = [index_map[bid] for bid in req.book_id if bid in index_map]
    if not seed_idx:
        return {"similar": []}

    import numpy as np
    seed_vec = matrix[seed_idx].mean(axis=0)
    sims = cosine_similarity(seed_vec, matrix).flatten()

    seed_set = set(seed_idx)
    ranked = [
        (i, float(sims[i])) for i in sims.argsort()[::-1]
        if i not in seed_set
    ]

    top = [
        {"book_id": id_list[i], "score": score}
        for i, score in ranked[:req.top_n]
    ]
    return {"similar": top}
