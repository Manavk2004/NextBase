"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const formSchema = z.object({
    credentialId: z.string().min(1, { message: "Credential is required" }),
    variableName: z.string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, { message: "Must be a valid variable name (letters, numbers, underscores)" }),
    message: z.string().min(1, { message: "Message is required" }),
    channel: z.string().optional(),
    username: z.string().optional(),
})

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit?: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<SlackMessageFormValues>;
}

export type SlackMessageFormValues = z.infer<typeof formSchema>;

export const SlackMessageDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const trpc = useTRPC();
    const credentialsQuery = useQuery(
        trpc.credentials.getByType.queryOptions({ type: "SLACK" })
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            credentialId: defaultValues?.credentialId || "",
            variableName: defaultValues?.variableName || "",
            message: defaultValues?.message || "",
            channel: defaultValues?.channel || "",
            username: defaultValues?.username || "",
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                credentialId: defaultValues?.credentialId || "",
                variableName: defaultValues?.variableName || "",
                message: defaultValues?.message || "",
                channel: defaultValues?.channel || "",
                username: defaultValues?.username || "",
            })
        }
    }, [open, defaultValues, form])

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit?.(values);
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Slack Message</DialogTitle>
                    <DialogDescription>Send a message to a Slack channel via incoming webhook.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-8 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Credential</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={
                                                    credentialsQuery.isLoading
                                                        ? "Loading credentials..."
                                                        : "Select a credential"
                                                } />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {credentialsQuery.data?.length === 0 && (
                                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                                    No credentials found.{" "}
                                                    <Link href="/credentials" className="underline text-primary">
                                                        Add one
                                                    </Link>
                                                </div>
                                            )}
                                            {credentialsQuery.data?.map((cred) => (
                                                <SelectItem key={cred.id} value={cred.id}>
                                                    {cred.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select a Slack webhook URL. <Link href="/credentials" className="underline">Manage credentials</Link>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="slackResult"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Unique name to reference this node&apos;s output (e.g. {`{{variableName.status}}`})
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="channel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Channel (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="#general"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Override the webhook&apos;s default channel
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bot Username (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Workflow Bot"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Override the webhook&apos;s default username
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={`New form submission from {{formData.name}}: {{formData.email}}`}
                                            className="min-h-[120px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Use {"{{variables}}"} to reference previous node outputs. Supports Slack markdown.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="mt-4">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
