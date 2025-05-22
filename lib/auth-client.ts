import { createAuthClient } from "better-auth/react";
import { organizationClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    organizationClient({
      teams: {
        enabled: true,
      },
    }),
  ],
});

export const { signIn, signUp, useSession } = authClient;
