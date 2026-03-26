"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeIcon,
  Loader2Icon,
  MousePointerIcon,
  WorkflowIcon,
  XCircleIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { ErrorView, LoadingView } from "@/components/entity-components";

type NodeResult = {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: "success" | "error";
  result?: unknown;
  error?: string;
  startedAt: string;
  completedAt: string;
};

const NODE_TYPE_LABELS: Record<string, string> = {
  MANUAL_TRIGGER: "Manual Trigger",
  GOOGLE_FORM_TRIGGER: "Google Form Trigger",
  STRIPE_TRIGGER: "Stripe Trigger",
  HTTP_REQUEST: "HTTP Request",
  GEMINI_PROMPT: "Gemini Prompt",
  OPENAI_PROMPT: "OpenAI Prompt",
  ANTHROPIC_PROMPT: "Claude Prompt",
  DISCORD_MESSAGE: "Discord Message",
  SLACK_MESSAGE: "Slack Message",
};

const NODE_TYPE_ICONS: Record<string, string | null> = {
  MANUAL_TRIGGER: null,
  GOOGLE_FORM_TRIGGER: "/logos/google.svg",
  STRIPE_TRIGGER: "/logos/stripe.svg",
  HTTP_REQUEST: null,
  GEMINI_PROMPT: "/logos/gemini-ai.svg",
  OPENAI_PROMPT: "/logos/openai.svg",
  ANTHROPIC_PROMPT: "/logos/anthropic.svg",
  DISCORD_MESSAGE: "/logos/discord.svg",
  SLACK_MESSAGE: "/logos/slack.svg",
};

const STATUS_CONFIG: Record<
  ExecutionStatus,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string; bg: string }
> = {
  RUNNING: {
    icon: Loader2Icon,
    label: "Running",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  SUCCESS: {
    icon: CheckCircleIcon,
    label: "Success",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  ERROR: {
    icon: XCircleIcon,
    label: "Failed",
    color: "text-red-600",
    bg: "bg-red-50",
  },
};

export const ExecutionDetail = ({ executionId }: { executionId: string }) => {
  const trpc = useTRPC();
  const { data: execution } = useSuspenseQuery(
    trpc.executions.getOne.queryOptions({ id: executionId })
  );

  const config = STATUS_CONFIG[execution.status];
  const StatusIcon = config.icon;

  return (
    <div className="p-4 md:px-10 md:py-6">
      <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/executions">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg md:text-xl font-semibold">
              Execution Details
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {execution.id}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <StatusIcon
                className={`size-4 ${config.color} ${execution.status === "RUNNING" ? "animate-spin" : ""}`}
              />
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-bold ${config.color}`}>
                {config.label}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflow</CardTitle>
              <WorkflowIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link
                href={`/workflows/${execution.workflow.id}`}
                className="text-lg font-bold hover:underline"
              >
                {execution.workflow.name}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trigger</CardTitle>
              <ZapIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {execution.trigger || "Unknown"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <ClockIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {execution.completedAt
                  ? `${((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000).toFixed(1)}s`
                  : "In progress..."}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="size-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Started</span>
              <span className="font-mono">
                {format(new Date(execution.startedAt), "PPpp")}
              </span>
            </div>
            {execution.completedAt && (
              <div className="flex items-center gap-3 text-sm">
                <div
                  className={`size-2 rounded-full ${execution.status === "SUCCESS" ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="text-muted-foreground">Completed</span>
                <span className="font-mono">
                  {format(new Date(execution.completedAt), "PPpp")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {execution.error && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-red-600">
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm font-mono text-red-600 whitespace-pre-wrap break-all bg-red-50 rounded-md p-3">
                {execution.error}
              </pre>
            </CardContent>
          </Card>
        )}

        {Array.isArray(execution.nodeResults) && (execution.nodeResults as NodeResult[]).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Node Executions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(execution.nodeResults as NodeResult[]).map((node, index) => (
                <div
                  key={node.nodeId || index}
                  className="border rounded-md p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {NODE_TYPE_ICONS[node.nodeType] ? (
                        <Image
                          src={NODE_TYPE_ICONS[node.nodeType]!}
                          alt={NODE_TYPE_LABELS[node.nodeType] || node.nodeType}
                          width={18}
                          height={18}
                          className="size-[18px] object-contain"
                          unoptimized
                        />
                      ) : node.nodeType === "HTTP_REQUEST" ? (
                        <GlobeIcon className="size-[18px] text-muted-foreground" />
                      ) : (
                        <MousePointerIcon className="size-[18px] text-muted-foreground" />
                      )}
                      <div>
                        <span className="font-medium text-sm">
                          {NODE_TYPE_LABELS[node.nodeType] || node.nodeType}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {node.nodeName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {node.startedAt && node.completedAt && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {((new Date(node.completedAt).getTime() - new Date(node.startedAt).getTime()) / 1000).toFixed(2)}s
                        </span>
                      )}
                      {node.status === "success" ? (
                        <CheckCircleIcon className="size-4 text-green-600" />
                      ) : (
                        <XCircleIcon className="size-4 text-red-600" />
                      )}
                    </div>
                  </div>

                  {node.error && (
                    <pre className="text-xs font-mono text-red-600 whitespace-pre-wrap break-all bg-red-50 rounded-md p-2">
                      {node.error}
                    </pre>
                  )}

                  {node.result != null && (
                    <details className="group">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View output
                      </summary>
                      <pre className="mt-2 text-xs font-mono whitespace-pre-wrap break-all bg-muted rounded-md p-2 max-h-60 overflow-auto">
                        {typeof node.result === "string"
                          ? node.result
                          : JSON.stringify(node.result, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export const ExecutionDetailLoading = () => {
  return <LoadingView message="Loading execution details..." />;
};

export const ExecutionDetailError = () => {
  return <ErrorView message="Error loading execution details" />;
};
