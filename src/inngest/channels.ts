import { channel, topic } from "@inngest/realtime";
import type { NodeStatus } from "@/components/react-flow/node-status-indicator";

export const workflowExecutionChannel = channel(
  (workflowId: string) => `workflow:${workflowId}`
).addTopic(
  topic("node-status").type<{ nodeId: string; status: NodeStatus }>()
);
