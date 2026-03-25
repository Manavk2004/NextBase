"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { AiPromptFormValues, AiPromptDialog } from "../ai-prompt/dialog"
import { useNodeStatus } from "@/features/executions/hooks/use-node-status"

const MODELS = [
    { label: "Claude Sonnet 4", value: "claude-sonnet-4-20250514" },
    { label: "Claude Haiku 3.5", value: "claude-3-5-haiku-20241022" },
    { label: "Claude Opus 4", value: "claude-opus-4-20250514" },
]

type AnthropicPromptNodeData = {
    credentialId?: string;
    variableName?: string;
    model?: string;
    systemPrompt?: string;
    prompt?: string;
}

type AnthropicPromptNodeType = Node<AnthropicPromptNodeData>;

export const AnthropicPromptNode = memo((props: NodeProps<AnthropicPromptNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()
    const nodeStatus = useNodeStatus(props.id)

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: AiPromptFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: { ...node.data, ...values, provider: "anthropic" }
                }
            }
            return node
        }))
    }

    const nodeData = props.data;
    const description = nodeData?.prompt
        ? `${nodeData.variableName ? `[${nodeData.variableName}] ` : ""}${nodeData.model || "claude-sonnet-4-20250514"}`
        : "Not configured"

    return (
        <>
            <AiPromptDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
                title="Claude Prompt"
                description="Generate text using Anthropic's Claude models."
                models={MODELS}
                defaultModel="claude-sonnet-4-20250514"
                providerType="ANTHROPIC"
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/anthropic.svg"
                name="Claude Prompt"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

AnthropicPromptNode.displayName = "AnthropicPromptNode"
