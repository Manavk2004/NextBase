import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { DiscordTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { useAtomValue } from "jotai";
import { workflowIdAtom } from "@/features/editor/store/atoms";

export const DiscordTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const nodeStatus = useNodeStatus(props.id);
    const workflowId = useAtomValue(workflowIdAtom);

    const baseUrl = process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL
        || (typeof window !== "undefined" ? window.location.origin : "");

    const webhookUrl = workflowId
        ? `${baseUrl}/api/webhooks/discord/${workflowId}`
        : "";

    const truncatedUrl = webhookUrl.length > 40
        ? `${webhookUrl.slice(0, 40)}...`
        : webhookUrl;

    const handleOpenSettings = () => setDialogOpen(true);

    return (
        <>
            <DiscordTriggerDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                webhookUrl={webhookUrl}
            />
            <BaseTriggerNode
                {...props}
                icon="/logos/discord.svg"
                name="When Discord event is received"
                description={truncatedUrl}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

DiscordTriggerNode.displayName = "DiscordTriggerNode";
