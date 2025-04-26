"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke halaman login
    router.push("/login");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Mengarahkan...</p>
    </div>
  );
}
