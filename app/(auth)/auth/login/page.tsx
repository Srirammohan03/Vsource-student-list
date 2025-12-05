"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form1, setForm1] = useState({ email: "", password: "" });
  const [form2, setForm2] = useState({ employeeId: "" });

  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const router = useRouter();

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.loginStep1(form1);

      if (res?.data?.data?.locked === true) {
        router.replace("/account-locked");
        return;
      }

      setTempToken(res?.data?.tempToken);
      toast.success(res?.data?.message || "Successfully completed step 1");
      setStep(2);
    } catch (err: any) {
      const apiData = err.response?.data;

      if (apiData?.data?.locked === true) {
        router.replace("/account-locked");
        return;
      }

      setError(apiData?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = form2.employeeId.trim();
    if (!id) {
      setEmployeeName(null);
      return;
    }

    const check = setTimeout(async () => {
      try {
        const res = await authService.getUserByEmployeeId(id);
        setEmployeeName(res.data.user?.name || null);
      } catch {
        setEmployeeName(null);
      }
    }, 400); // debounce

    return () => clearTimeout(check);
  }, [form2.employeeId]);

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) return;

    setLoading(true);
    setError(null);

    try {
      const res = await authService.loginStep2({
        employeeId: form2.employeeId,
        tempToken,
      });

      if (res?.data?.data?.locked === true) {
        router.replace("/account-locked");
        return;
      }

      document.cookie = `token=${res.data.finalToken}; path=/;`;

      const meRes = await authService.me();
      const role = meRes.data.user.role;

      const redirectMap: Record<string, string> = {
        Admin: "/dashboard",
        SUB_ADMIN: "/student-registration",
        Accounts: "/dashboard",
      };

      toast.success(res?.data?.message || "Logged in Successfully");
      localStorage.removeItem("lockEmail");
      router.push(redirectMap[role] || "/dashboard");
    } catch (err: any) {
      const apiData = err.response?.data;
      if (apiData?.data?.locked === true) {
        router.replace("/account-locked");
        return;
      }

      toast.error(apiData?.message || "Attempt Failed");
      setError(apiData?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = /.{8,}/;
    // const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*(),.?":{}|<>]/;

    return (
      minLength.test(password) &&
      // upper.test(password) &&
      lower.test(password) &&
      number.test(password) &&
      special.test(password)
    );
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-red-50 via-slate-50 to-sky-50 px-4">
      {/* -------- LOGO -------- */}
      <div className="absolute top-32 w-full flex justify-center">
        <Image
          src="/assets/logo.webp"
          alt="VSource Logo"
          width={120}
          height={120}
          className="drop-shadow rounded-xl"
          priority
        />
      </div>

      <Card className="w-full max-w-md rounded-2xl shadow-md mt-28">
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

          {/* ---------- STEP 1 ---------- */}
          {step === 1 && (
            <form className="space-y-3" onSubmit={handleStep1}>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Login
                </Label>
                <Input
                  type="email"
                  required
                  value={form1.email}
                  onChange={(e) =>
                    setForm1((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="Enter the login"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form1.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm1((f) => ({ ...f, password: value }));

                      if (!validatePassword(value)) {
                        setPasswordError(
                          "Password must contain 8+ chars,  1 lowercase, 1 number, 1 special character"
                        );
                      } else {
                        setPasswordError(null);
                      }
                    }}
                    className="pr-10"
                    placeholder="Enter the password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                )}
              </div>

              <Button
                className="mt-2 w-full"
                disabled={loading || !!passwordError}
                type="submit"
              >
                {loading ? "Verifying..." : "Continue"}
              </Button>
            </form>
          )}

          {/* ---------- STEP 2 ---------- */}
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

              {/* ---------- SHOW EMPLOYEE NAME LIVE ---------- */}
              {form2.employeeId && (
                <div className="rounded-md border bg-slate-50 px-3 py-2 text-xs">
                  {employeeName ? (
                    <span className="text-green-700 font-medium">
                      ✓ Employee: {employeeName}
                    </span>
                  ) : (
                    <span className="text-red-500">No matching employee</span>
                  )}
                </div>
              )}

              <Button
                className="mt-2 w-full"
                disabled={loading || !employeeName}
                type="submit"
              >
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
