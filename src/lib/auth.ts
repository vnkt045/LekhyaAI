import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    providers: [

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || ""
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "user@example.com" },
                password: { label: "Password", type: "password" },
                type: { label: "Type", type: "text", placeholder: "portal" } // Optional discriminator
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // PORTAL USER LOGIN
                if (credentials.type === 'portal') {
                    const portalUser = await db.portalUser.findUnique({
                        where: { email: credentials.email },
                        include: { account: true }
                    });

                    if (!portalUser || !portalUser.isActive) return null;

                    // Direct comparison for now (Phase 4), ideally hash
                    // Assuming portal users are created with hashed passwords or temporary plain text for MVP?
                    // Let's assume bcrypt is used.
                    // If password stored is plain (for seed/testing), handle that?
                    // Stick to bcrypt for consistency. 
                    // Note: Schema definition says "Hashed".

                    const isValid = await bcrypt.compare(credentials.password, portalUser.password);
                    if (!isValid) return null;

                    return {
                        id: portalUser.id,
                        name: portalUser.name,
                        email: portalUser.email,
                        role: 'PORTAL_USER', // specific role flag
                        accountId: portalUser.accountId // Carry this for easy filtering
                    };
                }

                // STANDARD USER LOGIN
                const user = await db.user.findUnique({
                    where: { email: credentials.email },
                    include: {
                        companies: {
                            include: { company: true }
                        }
                    }
                });

                if (!user) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    return null;
                }

                // Determine Active Company
                let companyId = null;
                let companyName = null;

                if (user.companies && user.companies.length > 0) {
                    const defaultCo = user.companies.find(c => c.isDefault);
                    const activeCo = defaultCo || user.companies[0];
                    companyId = activeCo.companyId;
                    companyName = activeCo.company.name;

                    // Validate license before allowing login
                    const company = await db.company.findUnique({
                        where: { id: companyId },
                        include: { licenseKey: true }
                    });

                    if (company?.licenseKey) {
                        const license = company.licenseKey;

                        // Block login if license is disabled
                        if (license.status === 'DISABLED') {
                            throw new Error('License disabled. Contact support.');
                        }

                        // Block login if license is expired
                        if (license.status === 'EXPIRED' ||
                            (license.expiryDate && new Date(license.expiryDate) < new Date())) {
                            throw new Error('License expired. Please renew.');
                        }
                    }
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    companyId: companyId,
                    companyName: companyName
                };
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.accountId = user.accountId; // For Portal Users
                token.companyId = user.companyId;
                token.companyName = user.companyName;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.sub;
                session.user.accountId = token.accountId;
                session.user.companyId = token.companyId;
                session.user.companyName = token.companyName;
            }
            return session;
        }
    }
};
