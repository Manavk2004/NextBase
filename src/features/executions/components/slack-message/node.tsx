"use client"

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecutionNode } from "../base-execution-node"
import { SlackMessageDialog, SlackMessageFormValues } from "./dialog"
import { useNodeStatus } from "@/features/executions/hooks/use-node-status"

type SlackMessageNodeData = {
    credentialId?: string;
    variableName?: string;
    message?: string;
    channel?: string;
    username?: string;
}

type SlackMessageNodeType = Node<SlackMessageNodeData>;

export const SlackMessageNode = memo((props: NodeProps<SlackMessageNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()
    const nodeStatus = useNodeStatus(props.id)

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: SlackMessageFormValues) => {
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
        ? `${nodeData.variableName ? `[${nodeData.variableName}] ` : ""}${nodeData.channel ? `#${nodeData.channel}` : "Send message"}`
        : "Not configured"

    return (
        <>
            <SlackMessageDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/logos/slack.svg"
                name="Slack Message"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

SlackMessageNode.displayName = "SlackMessageNode"
