const { Router } = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");

dotenv.config();
const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// ---------- MongoDB ----------

const mongourl = process.env.DB_URL 

const client = new MongoClient(mongourl);
let db, chunkscollection;

(async () => {
  await client.connect();
  db = client.db("bookchat");
  chunkscollection = db.collection("book_chunks");
  // Run this once to create the index
  
  console.log("✅ Connected to MongoDB");
})();

// ---------- Gemini ----------

const genAI = new GoogleGenerativeAI(
  process.env.API_KEY 
);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

// ---------- Embedding Model (dynamic import) ----------
let embedder;
(async () => {
  const { pipeline } = await import("@xenova/transformers");
  console.log("Loading embedding model...");
  embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  console.log("✅ Embedding model ready");
})();

// ---------- Utils ----------
function chunkText(text, chunksize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunksize - overlap) {
    const chunk = words.slice(i, i + chunksize).join(" ");
    chunks.push(chunk);
  }
  return chunks;
}

async function getEmbedding(text) {
  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data);
}

// ---------- Routes ----------

// Upload Book
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, author } = req.body;
    if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
    }
    const fileBuffer = req.file.buffer;

    console.log('filebuffer : ',fileBuffer);
    

    // dynamic import pdf-parse
    // const pdfParse = (await import("pdf-parse")).default;
    const pdfParse = require("pdf-parse");
    const pdfData = await pdfParse(fileBuffer);
    const text = pdfData.text;

    const chunks = chunkText(text);

    let insertedDocs = [];
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      const doc = {
        book_title: title,
        author: author,
        text: chunk,
        embedding: embedding,
      };
      const result = await chunkscollection.insertOne(doc);
      insertedDocs.push(result.insertedId);
    }

    res.json({
      message: `Inserted ${chunks.length} chunks for book '${title}'`,
      title: title,
      inserted: insertedDocs.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// Chat with Book
router.post("/chat", async (req, res) => {
  try {
    const { question, title } = req.body;
    if (!question) return res.status(400).send("Question required");

    const embedding = await getEmbedding(question);

    const result = await chunkscollection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index", // 👈 must match your Atlas index name
            path: "embedding",
            queryVector: embedding,
            numCandidates: 100,
            limit:3,
          },
        },
        {
          $project: {
            text: 1,
            book_title: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ])
      .toArray();

    // Step 1: Pre-filter chunks for this book
    // const bookChunks = await chunkscollection
    //   .find({ book_title: title }) // normal Mongo filter
    //   .project({ text: 1, embedding: 1 })
    //   .toArray();

    // if (!bookChunks.length) return res.json({ answer: "No chunks found for this book.", sources: [] });

    // // Step 2: Compute similarity locally (cosine)
    // function cosineSim(a, b) {
    //   const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    //   const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    //   const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    //   return dot / (normA * normB);
    // }

    // // Score each chunk
    // const scored = bookChunks.map(c => ({
    //   ...c,
    //   score: cosineSim(embedding, c.embedding),
    // }));

    // // Sort by score descending
    // scored.sort((a, b) => b.score - a.score);

    // // Take top 5
    // const topChunks = scored.slice(0, 8);
    let response = '';
    const filtered = result.filter(r => r.book_title === title);
    const context = filtered.map((r) => r.text).join("\n");
    if(context){
      const prompt = `Answer based on this book:\n${context}\n\nQ: ${question}\nA:`;
      response = await model.generateContent(prompt);
    }
    else{
      const prompt = `Answer based on this book_title :\n${title}\n\nQ: ${question}\nA:`;
      response = await model.generateContent(prompt);
    }
    console.log('response : ',response);
    
    const answer = response.response.candidates[0].content.parts[0].text;
    console.log("answer:",answer);
    
    
    res.json({
      answer,
      sources: filtered.map((r) => ({
        text: r.text,
        book_title: r.book_title,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({err});
  }
});

module.exports = router;
