"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button, type ButtonProps } from "@/components/ui/button";

type LogoutButtonProps = Omit<ButtonProps, "onClick">;

export function LogoutButton({
  className,
  variant = "outline",
  size = "sm",
  ...props
}: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button
      {...props}
      onClick={logout}
      variant={variant}
      size={size}
      className={className}
    >
      Logout
    </Button>
  );
}
