import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export const LogoutButton = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  );
};