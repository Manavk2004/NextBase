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

export const StripeTriggerDialog = ({
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
                    <DialogTitle>Stripe Trigger</DialogTitle>
                    <DialogDescription>
                        Trigger this workflow when a Stripe event occurs (e.g. payment, subscription, invoice).
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
                            <li>Go to the <strong>Stripe Dashboard</strong> &rarr; <strong>Developers</strong> &rarr; <strong>Webhooks</strong>.</li>
                            <li>Click <strong>Add endpoint</strong>.</li>
                            <li>Paste the <strong>Webhook URL</strong> above into the endpoint URL field.</li>
                            <li>Under <strong>Select events to listen to</strong>, choose the events you want to trigger this workflow (e.g. <code>checkout.session.completed</code>, <code>invoice.paid</code>, <code>customer.subscription.created</code>).</li>
                            <li>Click <strong>Add endpoint</strong> to save.</li>
                            <li>Copy the <strong>Signing secret</strong> (<code>whsec_...</code>) from the endpoint details page. You will need this to verify webhook signatures in production.</li>
                        </ol>
                    </div>

                    <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                        <strong>Note:</strong> For local development, use the <a href="https://stripe.com/docs/stripe-cli" target="_blank" rel="noopener noreferrer" className="underline">Stripe CLI</a> to forward events:
                        <pre className="mt-2 font-mono whitespace-pre-wrap break-all">
{`stripe listen --forward-to ${webhookUrl || "YOUR_WEBHOOK_URL"}`}
                        </pre>
                    </div>

                    {/* TODO: Add a field to store the Stripe webhook signing secret (whsec_...) for signature verification */}
                    {/* TODO: Add event type filter selection to only trigger on specific Stripe events */}
                </div>
            </DialogContent>
        </Dialog>
    )
}
