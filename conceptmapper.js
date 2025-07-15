import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

// ✅ LangChain v0.3+ imports
import { OpenAI } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains/retrieval_qa";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

dotenv.config();

const mapTranscriptToConcepts = async (transcriptText) => {
  try {
    // ✅ Path to ncert.json
    const ncertPath = path.resolve("ncert.json");

    // ✅ Load NCERT concepts from JSON
    const loader = new JSONLoader(ncertPath, "/concepts");
    const docs = await loader.load();

    // ✅ Split documents into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 300,
      chunkOverlap: 30,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // ✅ Create a vector store with OpenAI embeddings
    const vectorstore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings()
    );

    // ✅ Initialize LLM
    const model = new OpenAI({
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY, // Make sure you have this in .env
    });

    // ✅ Create RetrievalQAChain
    const chain = RetrievalQAChain.fromLLM(model, vectorstore.asRetriever());

    // ✅ Run the query
    const response = await chain.call({
      query: `Map this transcript to relevant NCERT concepts with chapter, section, and page: ${transcriptText}`,
    });

    return response.text;
  } catch (error) {
    console.error("❌ Concept mapping failed:", error.message);
    return "❌ Concept mapping failed.";
  }
};

export default mapTranscriptToConcepts;
