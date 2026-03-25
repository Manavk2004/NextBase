"use client"

import { type NodeProps } from "@xyflow/react"
import { memo } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { useNodeStatus } from "@/features/executions/hooks/use-node-status"
import { toast } from "sonner"

export const OpenaiPromptNode = memo((props: NodeProps) => {
    const nodeStatus = useNodeStatus(props.id)

    const handleOpenSettings = () => {
        toast.error("OpenAI is not available yet")
    }

    return (
        <BaseExecutionNode
            {...props}
            id={props.id}
            icon="/logos/openai.svg"
            name="OpenAI Prompt"
            description="Not available yet"
            status={nodeStatus}
            onSettings={handleOpenSettings}
            onDoubleClick={handleOpenSettings}
        />
    )
})

OpenaiPromptNode.displayName = "OpenaiPromptNode"
