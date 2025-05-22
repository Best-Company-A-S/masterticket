import { Button } from "@/components/ui/button";
import ShineText from "@/components/ui/shine-text";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Link href="/dashboard">
        <Button variant="ghost">
          <ShineText text="Dashboard" disabled={false} speed={3} />
        </Button>
      </Link>
    </div>
  );
}
