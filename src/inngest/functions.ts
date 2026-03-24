import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/lib/executor-registry";


const google = createGoogleGenerativeAI()

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps } = await step.ai.wrap(
        "gemini-generate-text",
        generateText,
        {
        model: google("gemini-2.5-flash"),
        system: "You are a helpful assistant.",
        prompt: event.data.prompt ?? "What is 2 + 2?",
        experimental_telemetry: {
            isEnabled: true,
            recordInputs: true,
            recordOutputs: true
        }
        }
    )

    return steps
  },
);

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflows/execute.workflow" },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // Initialize context with any initial data from the trigger
    let context: Record<string, unknown> = event.data.initialData || {};

    // Execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);

      // Use the node's variableName (from node.data) as the context key
      // This prevents key collisions when multiple nodes of the same type exist
      const nodeData = (node.data as Record<string, unknown>) || {};
      const variableName = (nodeData.variableName as string) || node.id;

      // TODO: Actually invoke executor and store result
      // const result = await step.run(`execute-node-${node.id}`, async () => {
      //   return (executor as Function)(node, context);
      // });
      // context = { ...context, [variableName]: result };
    }

    return { sortedNodes };
  },
);