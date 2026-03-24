import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { useAtomValue } from "jotai";
import { workflowIdAtom } from "@/features/editor/store/atoms";

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const nodeStatus = useNodeStatus(props.id);
    const workflowId = useAtomValue(workflowIdAtom);

    const webhookUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/api/webhooks/google-form/${workflowId}`
            : "";

    const truncatedUrl = webhookUrl.length > 40
        ? `${webhookUrl.slice(0, 40)}...`
        : webhookUrl;

    const handleOpenSettings = () => setDialogOpen(true);

    return (
        <>
            <GoogleFormTriggerDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                webhookUrl={webhookUrl}
            />
            <BaseTriggerNode
                {...props}
                icon="/logos/google.svg"
                name="When Google Form is submitted"
                description={truncatedUrl}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

GoogleFormTriggerNode.displayName = "GoogleFormTriggerNode";
