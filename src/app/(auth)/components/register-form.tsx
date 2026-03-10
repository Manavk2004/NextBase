"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"


const registerSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

type RegisterFormValues = z.infer<typeof registerSchema>

function getReadableAuthError(error: { message?: string; statusText?: string; status?: number }): string {
    const raw = error.message || ""

    if (raw.includes("User already exists") || raw.includes("external ID cannot be updated")) {
        return "An account with this email already exists. Please log in instead."
    }
    if (raw.includes("Invalid email or password") || raw.includes("INVALID_PASSWORD")) {
        return "Invalid email or password."
    }
    if (raw.includes("too many requests") || error.status === 429) {
        return "Too many attempts. Please try again later."
    }
    if (raw.includes("password") && raw.includes("short")) {
        return "Password is too short. Please use at least 8 characters."
    }

    // If it looks like a raw JSON/API dump, show a generic message
    if (raw.includes("{") && raw.includes("}")) {
        return "Something went wrong. Please try again."
    }

    return raw || error.statusText || "Sign up failed. Please try again."
}

export function RegisterForm(){
    const router = useRouter()
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: ""
        }
    })


    const onSubmit = async (values: RegisterFormValues) => {
        await authClient.signUp.email(
            {
                name: values.email,
                email: values.email,
                password: values.password,
                callbackURL: "/"
            },
            {
                onSuccess: () => {
                    router.push("/")
                },
                onError: (ctx) => {
                    toast.error(getReadableAuthError(ctx.error))
                }
            }
        )
    }

    const isPending = form.formState.isSubmitting;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        Get Started
                    </CardTitle>
                    <CardDescription>
                        Create your account to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="flex flex-col gap-4">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        type="button"
                                        disabled={isPending}
                                    >
                                        <Image alt="Github" src="/logos/github.svg" width={20} height={20} />    
                                        Continue with GitHub
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        type="button"
                                        disabled={isPending}
                                    >
                                        <Image alt="Google" src="/logos/google.svg" width={20} height={20} />
                                        Continue with Google
                                    </Button>
                                </div>
                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="m@example.com"
                                                        {...field}
                                                    >
                                                    </Input>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}

                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="*********"
                                                        {...field}
                                                    >
                                                    </Input>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}

                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="*********"
                                                        {...field}
                                                    >
                                                    </Input>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}

                                    />
                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        Sign Up
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                   Already have an account?{" "}
                                    <Link href="/login" className="underline underline-offset-4">
                                        Login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )


}