import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("Missing Pinecone API key in environment variables");
}

const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const getPineconeClient = () => {
  return pineconeClient;
};

export const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX_NAME || "pdftalk");
