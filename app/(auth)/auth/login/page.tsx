"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [form1, setForm1] = useState({ email: "", password: "" });
  const [form2, setForm2] = useState({ employeeId: "" });
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("from") || "/dashboard";

  /* ----------------------------- STEP 1 ----------------------------- */
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.loginStep1(form1);
      setTempToken(res.data.tempToken);
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------- STEP 2 ----------------------------- */
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) return;

    setLoading(true);
    setError(null);

    try {
      await authService.loginStep2({
        employeeId: form2.employeeId,
        tempToken, // FIXED REQUIRED FIELD
      });

      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-red-50 via-slate-50 to-sky-50 px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-lg">
            VSource Education Admin Login
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step Indicator */}
          <div className="flex justify-center gap-2 text-xs font-medium">
            <span
              className={
                step === 1 ? "text-primary" : "text-slate-400 line-through"
              }
            >
              Step 1: Account
            </span>
            <span>›</span>
            <span className={step === 2 ? "text-primary" : "text-slate-400"}>
              Step 2: Employee ID
            </span>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          {/* ---------- STEP 1 UI ---------- */}
          {step === 1 && (
            <form className="space-y-3" onSubmit={handleStep1}>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={form1.email}
                  onChange={(e) =>
                    setForm1((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Password
                </label>
                <Input
                  type="password"
                  required
                  value={form1.password}
                  onChange={(e) =>
                    setForm1((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="text-xs text-slate-500 hover:text-primary"
                >
                  Forgot Password?
                </button>
              </div>

              <Button className="mt-2 w-full" disabled={loading} type="submit">
                {loading ? "Verifying..." : "Continue"}
              </Button>
            </form>
          )}

          {/* ---------- STEP 2 UI ---------- */}
          {step === 2 && (
            <form className="space-y-3" onSubmit={handleStep2}>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Employee ID
                </label>
                <Input
                  required
                  value={form2.employeeId}
                  onChange={(e) =>
                    setForm2((f) => ({ ...f, employeeId: e.target.value }))
                  }
                />
              </div>

              <Button className="mt-2 w-full" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Login"}
              </Button>

              <button
                type="button"
                className="mt-2 w-full text-center text-xs text-slate-500 hover:text-primary"
                onClick={() => setStep(1)}
              >
                Go back to Step 1
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
