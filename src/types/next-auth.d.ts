import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            companyId?: string | null
            companyName?: string | null
            accountId?: string | null // For Portal Users
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        id: string
        role: string
        companyId?: string | null
        companyName?: string | null
        accountId?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        companyId?: string | null
        companyName?: string | null
        accountId?: string | null
    }
}
