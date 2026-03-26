import { checkout, polar, portal } from "@polar-sh/better-auth"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { dash } from "@better-auth/infra"
import prisma from "./db"
import { polarClient } from "./polar"
    

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    plugins: [
        dash(),
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            enableCustomerSessionSync: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "8f5cfd27-a746-4202-bbaf-b720ab6a8afb",
                            slug: "Nextbase-Pro"
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true
                }),
                portal()
            ]
        })
    ]
})

