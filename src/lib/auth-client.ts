import { createAuthClient } from "better-auth/react"
import { polarClient } from "@polar-sh/better-auth"
import { sentinelClient } from "@better-auth/infra/client"

export const authClient = createAuthClient({
    plugins: [ polarClient(), sentinelClient() ]
})