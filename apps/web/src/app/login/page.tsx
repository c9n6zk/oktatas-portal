"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Hibás email vagy jelszó");
      return;
    }
    toast.success("Sikeres belépés");
    router.push(search.get("from") ?? "/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Belépés</CardTitle>
        <CardDescription>Add meg az email címedet és a jelszavadat.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Jelszó</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Belépés..." : "Belépés"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Nincs még fiókod?{" "}
            <Link href="/register" className="underline">
              Regisztrálj
            </Link>
          </p>
          <div className="text-xs text-muted-foreground border-t pt-3">
            <p className="font-medium mb-1">Demo fiókok (password: <code>password</code>):</p>
            <ul className="space-y-0.5 font-mono">
              <li>superadmin@demo.hu</li>
              <li>admin@demo.hu</li>
              <li>instructor@demo.hu</li>
              <li>student@demo.hu</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-muted-foreground">Betöltés...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
