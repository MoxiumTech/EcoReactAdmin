"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();
  const params = useParams();
  const domain = params?.domain;

  useEffect(() => {
    const signOut = async () => {
      try {
        const origin = window.location.origin;
        // Call our new storefront signout endpoint
        const response = await fetch(`${origin}/api/storefront/${domain}/auth/signout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Signout failed');
        }

        // Clear local cart state if needed
        localStorage.removeItem(`cart_${domain}`);

        // Redirect to homepage
        router.push(`/store/${domain}`);
      } catch (error) {
        console.error('Error signing out:', error);
        // Still redirect to homepage on error
        router.push(`/store/${domain}`);
      }
    };

    signOut();
  }, [router, domain]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Signing out...</h1>
        <p className="text-muted-foreground">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}
