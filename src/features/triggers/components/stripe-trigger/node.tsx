import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { StripeTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { useAtomValue } from "jotai";
import { workflowIdAtom } from "@/features/editor/store/atoms";

export const StripeTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const nodeStatus = useNodeStatus(props.id);
    const workflowId = useAtomValue(workflowIdAtom);

    const baseUrl = process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL
        || (typeof window !== "undefined" ? window.location.origin : "");

    const webhookUrl = workflowId
        ? `${baseUrl}/api/webhooks/stripe/${workflowId}`
        : "";

    const truncatedUrl = webhookUrl.length > 40
        ? `${webhookUrl.slice(0, 40)}...`
        : webhookUrl;

    const handleOpenSettings = () => setDialogOpen(true);

    return (
        <>
            <StripeTriggerDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                webhookUrl={webhookUrl}
            />
            <BaseTriggerNode
                {...props}
                icon="/logos/stripe.svg"
                name="When Stripe event is received"
                description={truncatedUrl}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

StripeTriggerNode.displayName = "StripeTriggerNode";
