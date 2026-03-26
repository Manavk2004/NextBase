import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { NodeType } from "@/generated/prisma/enums";
import { inngest } from "@/inngest/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;

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

  const hasDiscordTrigger = workflow.nodes.some(
    (node) => node.type === NodeType.DISCORD_TRIGGER
  );

  if (!hasDiscordTrigger) {
    return NextResponse.json(
      { error: "Workflow does not have a Discord trigger" },
      { status: 400 }
    );
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  await inngest.send({
    name: "workflows/execute.workflow",
    data: {
      workflowId,
      triggerNodeType: "DISCORD_TRIGGER",
      userId: workflow.userId,
      initialData: { discordEvent: body },
    },
  });

  return NextResponse.json({ success: true });
}
