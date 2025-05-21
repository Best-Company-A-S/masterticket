"use client";

import { useSession } from "@/lib/auth-client";
import { useOrganization } from "@/lib/hooks/use-organization";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { activeOrganization } = useOrganization();
  return (
    <div className="flex items-center h-screen justify-center">
      <div className="flex flex-col items-center">
        <h1>Welcome to dashboard, {session?.user?.name} 👋</h1>
        <p>
          You are currently in{" "}
          <span className="font-bold text-primary">
            {activeOrganization?.name}
          </span>{" "}
          organization
        </p>
      </div>
    </div>
  );
}
