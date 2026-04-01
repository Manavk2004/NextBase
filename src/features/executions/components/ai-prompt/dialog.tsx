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
import { CredentialType } from "@prisma/client";
import Link from "next/link";

export type ModelOption = { label: string; value: string };

const formSchema = z.object({
    credentialId: z.string().min(1, { message: "Credential is required" }),
    variableName: z.string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, { message: "Must be a valid variable name (letters, numbers, underscores)" }),
    model: z.string().min(1, { message: "Model is required" }),
    systemPrompt: z.string().optional(),
    prompt: z.string().min(1, { message: "Prompt is required" }),
})

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit?: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<AiPromptFormValues>;
    title: string;
    description: string;
    models: ModelOption[];
    defaultModel: string;
    providerType: CredentialType;
}

export type AiPromptFormValues = z.infer<typeof formSchema>;

export const AiPromptDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
    title,
    description,
    models,
    defaultModel,
    providerType,
}: Props) => {
    const trpc = useTRPC();
    const credentialsQuery = useQuery(
        trpc.credentials.getByType.queryOptions({ type: providerType })
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            credentialId: defaultValues?.credentialId || "",
            variableName: defaultValues?.variableName || "",
            model: defaultValues?.model || defaultModel,
            systemPrompt: defaultValues?.systemPrompt || "",
            prompt: defaultValues?.prompt || "",
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                credentialId: defaultValues?.credentialId || "",
                variableName: defaultValues?.variableName || "",
                model: defaultValues?.model || defaultModel,
                systemPrompt: defaultValues?.systemPrompt || "",
                prompt: defaultValues?.prompt || "",
            })
        }
    }, [open, defaultValues, form, defaultModel])

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit?.(values);
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
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
                                        Select an API key. <Link href="/credentials" className="underline">Manage credentials</Link>
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
                                            placeholder="aiResponse"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Unique name to reference this node&apos;s output (e.g. {`{{variableName.text}}`})
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a model" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {models.map((m) => (
                                                <SelectItem key={m.value} value={m.value}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                        <FormDescription>
                                            The specific model to use
                                        </FormDescription>
                                        <FormMessage />
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="systemPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>System Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="You are a helpful assistant that summarizes data."
                                            className="min-h-[80px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Optional instructions for how the AI should behave
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={`Summarize this data: {{httpResponse.data}}`}
                                            className="min-h-[120px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Use {"{{variables}}"} to reference previous node outputs
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
