"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { AiPromptFormValues, AiPromptDialog } from "../ai-prompt/dialog"
import { useNodeStatus } from "@/features/executions/hooks/use-node-status"

const MODELS = [
    { label: "GPT-4o", value: "gpt-4o" },
    { label: "GPT-4o Mini", value: "gpt-4o-mini" },
    { label: "GPT-4.1", value: "gpt-4.1" },
    { label: "GPT-4.1 Mini", value: "gpt-4.1-mini" },
]

type OpenaiPromptNodeData = {
    credentialId?: string;
    variableName?: string;
    model?: string;
    systemPrompt?: string;
    prompt?: string;
}

type OpenaiPromptNodeType = Node<OpenaiPromptNodeData>;

export const OpenaiPromptNode = memo((props: NodeProps<OpenaiPromptNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()
    const nodeStatus = useNodeStatus(props.id)

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: AiPromptFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: { ...node.data, ...values, provider: "openai" }
                }
            }
            return node
        }))
    }

    const nodeData = props.data;
    const description = nodeData?.prompt
        ? `${nodeData.variableName ? `[${nodeData.variableName}] ` : ""}${nodeData.model || "gpt-4o-mini"}`
        : "Not configured"

    return (
        <>
            <AiPromptDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
                title="OpenAI Prompt"
                description="Generate text using OpenAI models."
                models={MODELS}
                defaultModel="gpt-4o-mini"
                providerType="OPENAI"
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/openai.svg"
                name="OpenAI Prompt"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

OpenaiPromptNode.displayName = "OpenaiPromptNode"
