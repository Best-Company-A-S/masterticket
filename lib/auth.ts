import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  plugins: [
    organization({
      teams: {
        enabled: true,
        maximumTeams: 15,
        allowRemovingAllTeams: false,
      },
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
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          try {
            // Try to get the user's organizations
            const userOrganizations = await prisma.member.findMany({
              where: {
                userId: session.userId,
              },
              include: {
                organization: true,
              },
              take: 1,
            });

            // If the user has at least one organization, set it as active
            if (userOrganizations.length > 0) {
              return {
                data: {
                  ...session,
                  activeOrganizationId: userOrganizations[0].organizationId,
                },
              };
            }
          } catch (error) {
            console.error("Error setting active organization:", error);
          }

          return { data: session };
        },
      },
    },
  },
});
