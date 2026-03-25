import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import prisma from "@/lib/db";
import { topologicalSort, getReachableNodeIds } from "./utils";
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { workflowExecutionChannel } from "./channels";


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
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    const triggerNodeType = event.data.triggerNodeType as string | undefined;

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });

      const allSorted = topologicalSort(workflow.nodes, workflow.connections);

      if (!triggerNodeType) return allSorted;

      const triggerNode = workflow.nodes.find((n) => n.type === triggerNodeType);
      if (!triggerNode) return allSorted;

      const reachableIds = getReachableNodeIds(triggerNode.id, workflow.connections);
      return allSorted.filter((n) => reachableIds.has(n.id));
    });

    // Initialize context with any initial data from the trigger
    let context: Record<string, unknown> = {
      ...event.data.initialData || {},
      __userId: event.data.userId,
    };

    // Execute each node in topological order
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      const nodeData = (node.data as Record<string, unknown>) || {};
      const variableName = (nodeData.variableName as string) || node.id;

      await step.run(`publish-loading-${node.id}`, async () => {
        await publish(
          workflowExecutionChannel(workflowId)["node-status"]({
            nodeId: node.id,
            status: "loading",
          })
        );
      });

      try {
        const result = await step.run(`execute-node-${node.id}`, async () => {
          return executor(nodeData, context);
        });

        context = { ...context, [variableName]: result };

        await step.run(`publish-success-${node.id}`, async () => {
          await publish(
            workflowExecutionChannel(workflowId)["node-status"]({
              nodeId: node.id,
              status: "success",
            })
          );
        });
      } catch (error) {
        await step.run(`publish-error-${node.id}`, async () => {
          await publish(
            workflowExecutionChannel(workflowId)["node-status"]({
              nodeId: node.id,
              status: "error",
            })
          );
        });
        throw new NonRetriableError(
          `Node ${node.id} failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    return { context };
  },
);