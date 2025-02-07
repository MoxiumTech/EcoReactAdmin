'use client';

import { Button } from "@/components/ui/button";

export function NavigationButtons() {
  const redirectToAdmin = (path: string) => {
    window.location.href = `${window.location.protocol}//admin.${window.location.host}${path}`;
  };

  return (
    <>
      <Button 
        variant="ghost" 
        onClick={() => redirectToAdmin('/signin')}
        className="hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
      >
        Sign In
      </Button>
      <Button 
        onClick={() => redirectToAdmin('/signup')}
        className="bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
      >
        Sign Up
      </Button>
    </>
  );
}

export function HeroButtons() {
  const redirectToAdmin = (path: string) => {
    window.location.href = `${window.location.protocol}//admin.${window.location.host}${path}`;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Button 
        size="lg"
        onClick={() => redirectToAdmin('/signup')}
        className="bg-primary hover:bg-primary/90 text-white px-8 shadow-xl shadow-primary/20 
                   hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
      >
        Get Started
      </Button>
      <Button 
        size="lg" 
        onClick={() => redirectToAdmin('/signin')}
        className="bg-white hover:bg-gray-50 text-gray-900 px-8 shadow-lg hover:shadow-xl
                   border border-gray-200 hover:-translate-y-0.5 transition-all"
      >
        Login to Dashboard
      </Button>
    </div>
  );
}
