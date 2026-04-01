import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { NodeType } from "@prisma/client";
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

  const hasGoogleFormTrigger = workflow.nodes.some(
    (node) => node.type === NodeType.GOOGLE_FORM_TRIGGER
  );

  if (!hasGoogleFormTrigger) {
    return NextResponse.json(
      { error: "Workflow does not have a Google Form trigger" },
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
      triggerNodeType: "GOOGLE_FORM_TRIGGER",
      userId: workflow.userId,
      initialData: { formData: body },
    },
  });

  return NextResponse.json({ success: true });
}
