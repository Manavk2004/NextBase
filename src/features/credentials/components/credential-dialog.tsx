"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  useCreateCredential,
  useUpdateCredential,
} from "../hooks/use-credentials";
import { CredentialType } from "@/generated/prisma/enums";

const CREDENTIAL_TYPES = [
  { label: "OpenAI", value: "OPENAI" },
  { label: "Google / Gemini", value: "GOOGLE" },
  { label: "Anthropic", value: "ANTHROPIC" },
] as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.nativeEnum(CredentialType),
  apiKey: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type Props =
  | {
      mode: "create";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      credentialId?: never;
      defaultValues?: never;
    }
  | {
      mode: "edit";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      credentialId: string;
      defaultValues?: { name: string; type: CredentialType };
    };

export const CredentialDialog = ({
  mode,
  open,
  onOpenChange,
  credentialId,
  defaultValues,
}: Props) => {
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || CredentialType.OPENAI,
      apiKey: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: defaultValues?.name || "",
        type: defaultValues?.type || CredentialType.OPENAI,
        apiKey: "",
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (values: FormValues) => {
    if (mode === "create") {
      if (!values.apiKey) {
        form.setError("apiKey", { message: "API key is required" });
        return;
      }
      createCredential.mutate(
        { name: values.name, type: values.type, apiKey: values.apiKey },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      updateCredential.mutate(
        {
          id: credentialId!,
          name: values.name,
          ...(values.apiKey ? { apiKey: values.apiKey } : {}),
        },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  const isPending = createCredential.isPending || updateCredential.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Credential" : "Edit Credential"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Store an API key for an AI provider."
              : "Update your credential details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My OpenAI Key" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name for this credential
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={mode === "edit"}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CREDENTIAL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        mode === "edit"
                          ? "Leave blank to keep existing key"
                          : "sk-..."
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {mode === "edit"
                      ? "Only fill this in if you want to replace the existing key"
                      : "Your API key will be encrypted before storage"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
