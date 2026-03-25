import { NodeType } from "@/generated/prisma/enums";
import { interpolate } from "./template";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { getDecryptedApiKey } from "@/features/credentials/server/get-decrypted-key";

export type NodeExecutorContext = Record<string, unknown>;

export type NodeExecutor = (
  nodeData: Record<string, unknown>,
  context: NodeExecutorContext,
) => Promise<unknown>;

const manualTriggerExecutor: NodeExecutor = async () => {
  return { triggered: true };
};

const googleFormTriggerExecutor: NodeExecutor = async (_nodeData, context) => {
  return { triggered: true, formData: context.formData ?? {} };
};

const stripeTriggerExecutor: NodeExecutor = async (_nodeData, context) => {
  return { triggered: true, stripeEvent: context.stripeEvent ?? {} };
};

const initialExecutor: NodeExecutor = async () => {
  return {};
};

const httpRequestExecutor: NodeExecutor = async (nodeData, context) => {
  const method = (nodeData.method as string) || "GET";
  const rawEndpoint = (nodeData.endpoint as string) || "";
  const rawBody = (nodeData.body as string) || "";
  const contentType =
    (nodeData.contentType as string) || "application/json";

  // Interpolate template variables in endpoint and body
  const endpoint = interpolate(rawEndpoint, context);
  const body = rawBody ? interpolate(rawBody, context) : undefined;

  const headers: Record<string, string> = {};

  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    headers["Content-Type"] = contentType;
  }

  const response = await fetch(endpoint, {
    method,
    headers,
    body: ["POST", "PUT", "PATCH"].includes(method) ? body : undefined,
  });

  const responseText = await response.text();

  let data: unknown;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = responseText;
  }

  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    data,
  };
};

const geminiPromptExecutor: NodeExecutor = async (nodeData, context) => {
  const modelId = (nodeData.model as string) || "gemini-2.5-flash";
  const rawPrompt = (nodeData.prompt as string) || "";
  const rawSystemPrompt = (nodeData.systemPrompt as string) || "";
  const credentialId = nodeData.credentialId as string | undefined;

  const prompt = interpolate(rawPrompt, context);
  const system = rawSystemPrompt ? interpolate(rawSystemPrompt, context) : undefined;

  const googleOptions: { apiKey?: string } = {};
  if (credentialId) {
    try {
      const userId = context.__userId as string;
      googleOptions.apiKey = await getDecryptedApiKey(credentialId, userId);
    } catch (error) {
      throw new Error(`Failed to retrieve Gemini API key: ${error instanceof Error ? error.message : "Credential may have been deleted or is inaccessible."}`);
    }
  }

  const google = createGoogleGenerativeAI(googleOptions);
  const result = await generateText({
    model: google(modelId),
    system,
    prompt,
  });

  return {
    text: result.text,
    usage: result.usage,
    model: modelId,
    provider: "google",
  };
};

const openaiPromptExecutor: NodeExecutor = async (nodeData, context) => {
  const modelId = (nodeData.model as string) || "gpt-4o-mini";
  const rawPrompt = (nodeData.prompt as string) || "";
  const rawSystemPrompt = (nodeData.systemPrompt as string) || "";
  const credentialId = nodeData.credentialId as string | undefined;

  const prompt = interpolate(rawPrompt, context);
  const system = rawSystemPrompt ? interpolate(rawSystemPrompt, context) : undefined;

  const openaiOptions: { apiKey?: string } = {};
  if (credentialId) {
    try {
      const userId = context.__userId as string;
      openaiOptions.apiKey = await getDecryptedApiKey(credentialId, userId);
    } catch (error) {
      throw new Error(`Failed to retrieve OpenAI API key: ${error instanceof Error ? error.message : "Credential may have been deleted or is inaccessible."}`);
    }
  }

  const openai = createOpenAI(openaiOptions);
  const result = await generateText({
    model: openai(modelId),
    system,
    prompt,
  });

  return {
    text: result.text,
    usage: result.usage,
    model: modelId,
    provider: "openai",
  };
};

const anthropicPromptExecutor: NodeExecutor = async (nodeData, context) => {
  const modelId = (nodeData.model as string) || "claude-sonnet-4-5-20250929";
  const rawPrompt = (nodeData.prompt as string) || "";
  const rawSystemPrompt = (nodeData.systemPrompt as string) || "";
  const credentialId = nodeData.credentialId as string | undefined;

  const prompt = interpolate(rawPrompt, context);
  const system = rawSystemPrompt ? interpolate(rawSystemPrompt, context) : undefined;

  const anthropicOptions: { apiKey?: string } = {};
  if (credentialId) {
    try {
      const userId = context.__userId as string;
      anthropicOptions.apiKey = await getDecryptedApiKey(credentialId, userId);
    } catch (error) {
      throw new Error(`Failed to retrieve Anthropic API key: ${error instanceof Error ? error.message : "Credential may have been deleted or is inaccessible."}`);
    }
  }

  const anthropic = createAnthropic(anthropicOptions);
  const result = await generateText({
    model: anthropic(modelId),
    system,
    prompt,
  });

  return {
    text: result.text,
    usage: result.usage,
    model: modelId,
    provider: "anthropic",
  };
};

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.INITIAL]: initialExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GEMINI_PROMPT]: geminiPromptExecutor,
  [NodeType.OPENAI_PROMPT]: openaiPromptExecutor,
  [NodeType.ANTHROPIC_PROMPT]: anthropicPromptExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};
