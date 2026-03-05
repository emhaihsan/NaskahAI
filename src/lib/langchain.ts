import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { pineconeIndex } from "./pinecone";

export const getPineconeStore = async (namespace?: string) => {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: namespace || "default",
    textKey: "text",
  });
};
