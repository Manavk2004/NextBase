"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { DiscordMessageDialog, DiscordMessageFormValues } from "./dialog"
import { useNodeStatus } from "@/features/executions/hooks/use-node-status"

type DiscordMessageNodeData = {
    credentialId?: string;
    variableName?: string;
    message?: string;
    username?: string;
}

type DiscordMessageNodeType = Node<DiscordMessageNodeData>;

export const DiscordMessageNode = memo((props: NodeProps<DiscordMessageNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()
    const nodeStatus = useNodeStatus(props.id)

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: DiscordMessageFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: { ...node.data, ...values }
                }
            }
            return node
        }))
    }

    const nodeData = props.data;
    const description = nodeData?.message
        ? `${nodeData.variableName ? `[${nodeData.variableName}] ` : ""}Send message`
        : "Not configured"

    return (
        <>
            <DiscordMessageDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/discord.svg"
                name="Discord Message"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

DiscordMessageNode.displayName = "DiscordMessageNode"
