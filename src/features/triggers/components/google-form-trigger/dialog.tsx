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

const appsScript = `function onFormSubmit(e) {
  var responses = e.response.getItemResponses();
  var data = {};
  for (var i = 0; i < responses.length; i++) {
    data[responses[i].getItem().getTitle()] = responses[i].getResponse();
  }

  UrlFetchApp.fetch("YOUR_WEBHOOK_URL", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data),
  });
}`;

export const GoogleFormTriggerDialog = ({
    open,
    onOpenChange,
    webhookUrl
}: Props) => {
    const [copied, setCopied] = useState<"url" | "script" | null>(null);

    const handleCopy = async (text: string, type: "url" | "script") => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch {
            // Clipboard API not available
        }
    };

    const scriptWithUrl = appsScript.replace("YOUR_WEBHOOK_URL", webhookUrl);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Google Form Trigger</DialogTitle>
                    <DialogDescription>
                        Connect a Google Form to trigger this workflow on each submission.
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
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Apps Script</label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleCopy(scriptWithUrl, "script")}
                            >
                                {copied === "script" ? (
                                    <><CheckIcon className="size-3 mr-1" /> Copied</>
                                ) : (
                                    <><CopyIcon className="size-3 mr-1" /> Copy</>
                                )}
                            </Button>
                        </div>
                        <pre className="mt-1 rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap break-all">
{scriptWithUrl}
                        </pre>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Setup instructions</label>
                        <ol className="mt-1 list-decimal list-inside text-sm text-muted-foreground space-y-2">
                            <li>Open your Google Form, click the <strong>three-dot menu</strong> (top-right) &rarr; <strong>Apps Script</strong>.</li>
                            <li>Delete any existing code and paste the Apps Script above.</li>
                            <li>In the left sidebar, click the <strong>clock icon</strong> (Triggers).</li>
                            <li>Click <strong>+ Add Trigger</strong> (bottom-right corner).</li>
                            <li>Set: Function = <strong>onFormSubmit</strong>, Event source = <strong>From form</strong>, Event type = <strong>On form submit</strong>.</li>
                            <li>Click <strong>Save</strong>. A Google authorization popup will appear &mdash; if it&apos;s blocked, <strong>allow popups</strong> for <code>script.google.com</code> in your browser and try again.</li>
                            <li>In the consent screen, click <strong>Advanced</strong> &rarr; <strong>Go to Untitled project (unsafe)</strong> &rarr; <strong>Allow</strong>.</li>
                        </ol>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
