import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { organization, admin } from "better-auth/plugins";

// Custom function to generate 6-digit invitation codes
function generateInvitationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      impersonationSessionDuration: 60 * 60 * 2, // 2 hours
      defaultBanReason: "Violation of terms of service",
      defaultBanExpiresIn: 60 * 60 * 24 * 7, // 1 week
      bannedUserMessage:
        "Your account has been suspended. Please contact support if you believe this is an error.",
    }),
    organization({
      teams: {
        enabled: true,
        maximumTeams: 50,
        allowRemovingAllTeams: false,
      },
      // Custom invitation system using codes instead of emails
      sendInvitationEmail: async (data) => {
        // Generate a 6-digit code and store it in the invitation
        const code = generateInvitationCode();

        // For code-based invitations, we handle code generation in our custom API
        // The invitation record will be created through our API endpoints

        console.log(
          `Invitation code generated: ${code} for organization: ${data.organization.name}`
        );
        // In a real app, you might want to log this or handle it differently
        // since we're not sending emails
      },
      invitationExpiresIn: 48 * 60 * 60, // 48 hours
    }),
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});
