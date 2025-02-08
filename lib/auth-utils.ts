export const handleSignOut = async () => {
  try {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Clear any client-side storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies by setting expiry to past date
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Force a complete page refresh to clear all state
      window.location.href = '/signin';
    }
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
