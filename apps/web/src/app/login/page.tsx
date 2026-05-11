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

interface DemoAccount {
  email: string;
  name: string;
  role: string;
  color: string;
  description: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "superadmin@demo.hu",
    name: "Szuper Admin",
    role: "Szuper-admin",
    color: "bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
    description: "Minden funkció, admin kezelés",
  },
  {
    email: "admin@demo.hu",
    name: "Admin Anna",
    role: "Admin",
    color: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
    description: "Felhasználók, tárgyak, osztályok",
  },
  {
    email: "instructor@demo.hu",
    name: "Oktató Géza",
    role: "Oktató",
    color: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
    description: "Jegybeírás, statisztika",
  },
  {
    email: "student@demo.hu",
    name: "Diák Béla",
    role: "Diák",
    color: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    description: "Saját jegyek, súlyozott átlag",
  },
];

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  async function loginWith(emailToUse: string, pwToUse: string) {
    const res = await signIn("credentials", {
      email: emailToUse,
      password: pwToUse,
      redirect: false,
    });
    if (res?.error) {
      toast.error("Hibás email vagy jelszó");
      return false;
    }
    toast.success("Sikeres belépés");
    router.push(search.get("from") ?? "/dashboard");
    router.refresh();
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await loginWith(email, password);
    setLoading(false);
  }

  async function quickLogin(account: DemoAccount) {
    setQuickLoading(account.email);
    await loginWith(account.email, "password");
    setQuickLoading(null);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Belépés</CardTitle>
        <CardDescription>Lépj be a saját adataiddal, vagy próbáld ki egy demo fiókkal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Manuális belépés form */}
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="te@iskola.hu"
            />
          </div>
          <div className="space-y-1.5">
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
          <Button type="submit" className="w-full" disabled={loading || quickLoading !== null}>
            {loading ? "Belépés..." : "Belépés"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          Nincs még fiókod?{" "}
          <Link href="/register" className="underline">
            Regisztrálj
          </Link>
        </p>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">demo fiókok</span>
          </div>
        </div>

        {/* Demo quick-login gombok — a form ALATT */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            Kattints egy fiókra a gyors belépéshez
          </p>
          <div className="grid gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => quickLogin(account)}
                disabled={quickLoading !== null || loading}
                className={`text-left rounded-md border px-3 py-2 transition disabled:opacity-50 ${account.color}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">
                      {quickLoading === account.email ? "Belépés..." : account.name}
                    </div>
                    <div className="text-xs opacity-80">
                      {account.role} · {account.description}
                    </div>
                  </div>
                  <div className="text-xs font-mono opacity-60 hidden sm:block">
                    {account.email.split("@")[0]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
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
