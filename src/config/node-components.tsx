import { InitialNode } from "@/components/initial-node";
import { NodeType } from "@/generated/prisma/enums";
import { NodeTypes } from "@xyflow/react";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
import { GeminiPromptNode } from "@/features/executions/components/gemini-prompt/node";
import { OpenaiPromptNode } from "@/features/executions/components/openai-prompt/node";
import { AnthropicPromptNode } from "@/features/executions/components/anthropic-prompt/node";
import { DiscordMessageNode } from "@/features/executions/components/discord-message/node";
import { SlackMessageNode } from "@/features/executions/components/slack-message/node";


export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
    [NodeType.GEMINI_PROMPT]: GeminiPromptNode,
    [NodeType.OPENAI_PROMPT]: OpenaiPromptNode,
    [NodeType.ANTHROPIC_PROMPT]: AnthropicPromptNode,
    [NodeType.DISCORD_MESSAGE]: DiscordMessageNode,
    [NodeType.SLACK_MESSAGE]: SlackMessageNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
    [NodeType.STRIPE_TRIGGER]: StripeTriggerNode
} as const satisfies NodeTypes;


export type RegisteredNodeType = keyof typeof nodeComponents;
