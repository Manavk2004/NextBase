"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CopyIcon, CheckIcon } from "lucide-react"
import { useState } from "react"

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    webhookUrl: string;
}

export const SlackTriggerDialog = ({
    open,
    onOpenChange,
    webhookUrl
}: Props) => {
    const [copied, setCopied] = useState<"url" | null>(null);

    const handleCopy = async (text: string, type: "url") => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch {
            // Clipboard API not available
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Slack Trigger</DialogTitle>
                    <DialogDescription>
                        Trigger this workflow when a Slack event is received via webhook.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Webhook URL</label>
                        <div className="flex items-center gap-2 mt-1">
                            <Input
                                readOnly
                                value={webhookUrl}
                                className="font-mono text-xs"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleCopy(webhookUrl, "url")}
                            >
                                {copied === "url" ? (
                                    <CheckIcon className="size-4" />
                                ) : (
                                    <CopyIcon className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Setup instructions</label>
                        <ol className="mt-1 list-decimal list-inside text-sm text-muted-foreground space-y-2">
                            <li>Go to <strong>api.slack.com/apps</strong> and create a new Slack App (or select an existing one).</li>
                            <li>Navigate to <strong>Event Subscriptions</strong> and toggle it on.</li>
                            <li>Paste the <strong>Webhook URL</strong> above into the <strong>Request URL</strong> field.</li>
                            <li>Under <strong>Subscribe to bot events</strong>, add the events you want to listen for (e.g. <code>message.channels</code>, <code>app_mention</code>).</li>
                            <li>Click <strong>Save Changes</strong> and install the app to your workspace.</li>
                            <li>The event payload will be available as <code>{`{{slackEvent.fieldName}}`}</code> in subsequent nodes.</li>
                        </ol>
                    </div>

                    <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                        <strong>Note:</strong> Slack will send a verification challenge to the webhook URL when you first add it. This is handled automatically.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
