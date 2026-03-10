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
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"


const loginSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required")
})

type LoginFormValues = z.infer<typeof loginSchema>

function getReadableAuthError(error: { message?: string; statusText?: string; status?: number }): string {
    const raw = error.message || ""

    if (raw.includes("Invalid email or password") || raw.includes("INVALID_PASSWORD") || raw.includes("INVALID_EMAIL_OR_PASSWORD")) {
        return "Invalid email or password."
    }
    if (raw.includes("User not found") || raw.includes("user_not_found")) {
        return "No account found with this email."
    }
    if (raw.includes("too many requests") || error.status === 429) {
        return "Too many attempts. Please try again later."
    }

    if (raw.includes("{") && raw.includes("}")) {
        return "Something went wrong. Please try again."
    }

    return raw || error.statusText || "Login failed. Please try again."
}

export function LoginForm(){
    const router = useRouter()
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })


    const onSubmit = async (values: LoginFormValues) => {
        await authClient.signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: "/"
        }, {
            onSuccess: () => {
                router.push("/")
            },
            onError: (ctx) => {
                toast.error(getReadableAuthError(ctx.error))
            }
        })
    }

    const isPending = form.formState.isSubmitting;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        Welcome Back
                    </CardTitle>
                    <CardDescription>
                        Login to continue
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
                                            </FormItem>
                                        )}

                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="*********"
                                                        {...field}
                                                    >
                                                    </Input>
                                                </FormControl>
                                            </FormItem>
                                        )}

                                    />
                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        Login
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Dont have an account?{" "}
                                    <Link href="/signup" className="underline underline-offset-4">
                                        Sign Up
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