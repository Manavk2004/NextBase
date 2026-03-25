import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db";
import { NodeType } from "@/generated/prisma/enums";
import { inngest } from "@/inngest/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    return NextResponse.json(
      { error: "Webhook signing secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
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

  const hasStripeTrigger = workflow.nodes.some(
    (node) => node.type === NodeType.STRIPE_TRIGGER
  );

  if (!hasStripeTrigger) {
    return NextResponse.json(
      { error: "Workflow does not have a Stripe trigger" },
      { status: 400 }
    );
  }

  await inngest.send({
    name: "workflows/execute.workflow",
    data: {
      workflowId,
      triggerNodeType: "STRIPE_TRIGGER",
      userId: workflow.userId,
      initialData: { stripeEvent: event },
    },
  });

  return NextResponse.json({ success: true });
}
