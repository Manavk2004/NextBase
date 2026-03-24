import { NodeType } from "@/generated/prisma/enums";
import { interpolate } from "./template";

export type NodeExecutorContext = Record<string, unknown>;

export type NodeExecutor = (
  nodeData: Record<string, unknown>,
  context: NodeExecutorContext,
) => Promise<unknown>;

const manualTriggerExecutor: NodeExecutor = async () => {
  return { triggered: true };
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

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: initialExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};
