import fs from "fs/promises";
import path from "path";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import dotenv from "dotenv";

dotenv.config();

const mapTranscriptToConcepts = async (transcriptText) => {
  try {
    const ncertPath = path.resolve("ncert.json");

    const loader = new JSONLoader(ncertPath, "/concepts");
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 300,
      chunkOverlap: 30,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    const vectorstore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings()
    );

    const model = new OpenAI({ temperature: 0 });

    const chain = RetrievalQAChain.fromLLM(model, vectorstore.asRetriever());

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
