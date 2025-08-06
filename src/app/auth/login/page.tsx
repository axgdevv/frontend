"use client";

import LoginButton from "@/components/authentication/LoginButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard"); // Redirect to dashboard after login
    }
  }, [user, loading, router]);

  if (loading) return null;

  if (user) return null; // Will redirect

  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#00332A]">
            StructCheck AI
          </CardTitle>
          <CardDescription>
            Use your Google account to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
