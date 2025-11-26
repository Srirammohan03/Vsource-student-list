"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [form1, setForm1] = useState({ employeeId: "" });
  const [form2, setForm2] = useState({ newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /* ----------- STEP 1: VERIFY EMPLOYEE ID ----------- */
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authService.sendResetToken(form1.employeeId);
      setResetToken(res.data.resetToken);
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Employee ID not found");
    } finally {
      setLoading(false);
    }
  };

  /* ----------- STEP 2: RESET PASSWORD ----------- */
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) return;
    if (form2.newPassword !== form2.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword({
        resetToken,
        newPassword: form2.newPassword,
      });
      router.push("/auth/login?reset=success");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-slate-50 to-sky-50 px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-lg">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <p className="bg-red-50 text-xs text-red-700 p-2 rounded-md">
              {error}
            </p>
          )}

          {step === 1 && (
            <form className="space-y-3" onSubmit={handleStep1}>
              <div>
                <label className="text-xs font-medium">Employee ID</label>
                <Input
                  required
                  placeholder="Enter your Employee ID"
                  value={form1.employeeId}
                  onChange={(e) => setForm1({ employeeId: e.target.value })}
                />
              </div>

              <Button className="mt-2 w-full" disabled={loading} type="submit">
                {loading ? "Verifying..." : "Send Reset Link"}
              </Button>

              <Button
                variant="link"
                className="w-full text-xs"
                onClick={() => router.push("/auth/login")}
              >
                Back to login
              </Button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-3" onSubmit={handleStep2}>
              <div>
                <label className="text-xs font-medium">New Password</label>
                <Input
                  type="password"
                  required
                  value={form2.newPassword}
                  onChange={(e) =>
                    setForm2((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium">Confirm Password</label>
                <Input
                  type="password"
                  required
                  value={form2.confirmPassword}
                  onChange={(e) =>
                    setForm2((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>

              <Button className="mt-2 w-full" disabled={loading} type="submit">
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              <Button
                variant="link"
                className="w-full text-xs"
                onClick={() => setStep(1)}
              >
                Go back
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
