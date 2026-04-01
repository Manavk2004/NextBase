import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { NodeType } from "@prisma/client";
import { inngest } from "@/inngest/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;

  let body: Record<string, unknown> = {};
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Handle Slack URL verification challenge
  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { nodes: true },
  });

  if (!workflow) {
    return NextResponse.json(
      { error: "Workflow not found" },
      { status: 404 }
    );
  }

  const hasSlackTrigger = workflow.nodes.some(
    (node) => node.type === NodeType.SLACK_TRIGGER
  );

  if (!hasSlackTrigger) {
    return NextResponse.json(
      { error: "Workflow does not have a Slack trigger" },
      { status: 400 }
    );
  }

  await inngest.send({
    name: "workflows/execute.workflow",
    data: {
      workflowId,
      triggerNodeType: "SLACK_TRIGGER",
      userId: workflow.userId,
      initialData: { slackEvent: body },
    },
  });

  return NextResponse.json({ success: true });
}
