import { GoogleGenerativeAI, ChatSession, GenerativeModel } from "@google/generative-ai";
import { PORTFOLIO_CONTEXT } from "../constants";

// ============================================================================
// 🔑 SECURITY CONFIGURATION
// Your API key was leaked on GitHub and disabled by Google.
// To fix this:
// 1. Generate a NEW key at https://aistudio.google.com/app/apikey
// 2. Create a file named '.env' in the root directory
// 3. Add this line: VITE_GEMINI_API_KEY=your_new_key_here
// ============================================================================
// (Hardcoded key removed for security)
// ============================================================================

let genAI: GoogleGenerativeAI | null = null;
let currentModel: GenerativeModel | null = null;
let chatSession: ChatSession | null = null;
let currentModelName: string = "gemini-2.0-flash";

const AVAILABLE_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-flash-latest"
];

const initializeAI = (modelName: string = "gemini-2.0-flash") => {
  // Use Environment Variable for security
  const activeKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!activeKey) {
    console.error("AI Service Error: No API Key found. Please add VITE_GEMINI_API_KEY to your .env file.");
    return;
  }

  if (!genAI) {
    console.log("AI Service: Initializing Core...");
    genAI = new GoogleGenerativeAI(activeKey);
  }

  if (genAI) {
    console.log(`AI Service: Deploying Neural Model -> ${modelName}`);
    currentModelName = modelName;
    currentModel = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: PORTFOLIO_CONTEXT
    });
  }
};

export const createChatSession = async (forceReset = false): Promise<ChatSession> => {
  if (!currentModel || forceReset) {
    initializeAI(currentModelName);
  }

  if (!currentModel) {
    throw new Error("Neural Core Offline: Missing API Key Configuration.");
  }

  chatSession = currentModel.startChat({
    history: [],
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
    },
  });

  return chatSession;
};

// ... remaining logic (sendMessageStream, etc.) remains same but using updated init
export const sendMessageStream = async function* (text: string) {
  const modelsToTry = [
    currentModelName,
    ...AVAILABLE_MODELS.filter(m => m !== currentModelName)
  ];

  let success = false;
  let lastError: any;

  for (const modelName of modelsToTry) {
    try {
      if (modelName !== currentModelName || !chatSession) {
        initializeAI(modelName);
        await createChatSession(true);
      }

      if (!chatSession) throw new Error("No session");

      console.log(`AI Service: Connecting via ${modelName}...`);
      const result = await chatSession.sendMessageStream(text);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }

      success = true;
      break;

    } catch (error: any) {
      console.warn(`AI Service: Link lost with ${modelName}`, error);
      lastError = error;
      chatSession = null;
    }
  }

  if (!success) {
    const errorMessage = lastError?.message || lastError?.toString() || "Connection timeout";
    yield `I encountered an issue connecting to the AI neural network: ${errorMessage}. If you are the owner, please ensure your NEW API key is set in the .env file (the old one was leaked and disabled).`;
  }
};
