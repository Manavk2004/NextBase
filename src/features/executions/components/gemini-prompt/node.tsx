"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { AiPromptFormValues, AiPromptDialog } from "../ai-prompt/dialog"
import { useNodeStatus } from "@/features/executions/hooks/use-node-status"

const MODELS = [
    { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
    { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
    { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
]

type GeminiPromptNodeData = {
    variableName?: string;
    model?: string;
    systemPrompt?: string;
    prompt?: string;
}

type GeminiPromptNodeType = Node<GeminiPromptNodeData>;

export const GeminiPromptNode = memo((props: NodeProps<GeminiPromptNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()
    const nodeStatus = useNodeStatus(props.id)

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: AiPromptFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: { ...node.data, ...values, provider: "google" }
                }
            }
            return node
        }))
    }

    const nodeData = props.data;
    const description = nodeData?.prompt
        ? `${nodeData.variableName ? `[${nodeData.variableName}] ` : ""}${nodeData.model || "gemini-2.5-flash"}`
        : "Not configured"

    return (
        <>
            <AiPromptDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
                title="Gemini Prompt"
                description="Generate text using Google's Gemini models."
                models={MODELS}
                defaultModel="gemini-2.5-flash"
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/gemini-ai.svg"
                name="Gemini Prompt"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

GeminiPromptNode.displayName = "GeminiPromptNode"
