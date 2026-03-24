"use server";

import { inngest } from "@/inngest/client";
import { workflowExecutionChannel } from "@/inngest/channels";
import { getSubscriptionToken } from "@inngest/realtime";

export async function getNodeStatusToken(workflowId: string) {
  return await getSubscriptionToken(inngest, {
    channel: workflowExecutionChannel(workflowId),
    topics: ["node-status"],
  });
}
