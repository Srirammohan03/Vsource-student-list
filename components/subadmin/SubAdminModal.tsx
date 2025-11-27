"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BranchCode, BRANCH_OPTIONS } from "@/types/subAdmin";
import { Eye, EyeOff } from "lucide-react";

export type FormState = {
  staffName: string;
  mobile: string;
  email: string;
  password: string;
  branchCode: BranchCode | "";
};

export type FormErrors = Partial<Record<keyof FormState, string>>;

type Props = {
  open: boolean;
  loading?: boolean;
  title: string;
  form: FormState;
  errors: FormErrors;
  onChange: (field: keyof FormState, value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  mode: "add" | "edit";
};

export const SubAdminModal: React.FC<Props> = ({
  open,
  loading,
  title,
  form,
  errors,
  onChange,
  onClose,
  onSubmit,
  mode,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Form Start */}
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          {/* Staff Name */}
          <div>
            <Label>Staff Name</Label>
            <Input
              value={form.staffName}
              onChange={(e) => onChange("staffName", e.target.value)}
              placeholder="Enter Staff Name"
            />
            {errors.staffName && (
              <p className="text-xs text-red-600">{errors.staffName}</p>
            )}
          </div>

          {/* Employee ID */}
          {/* <div>
            <Label>Employee ID</Label>
            <Input
              value={form.employeeId}
              onChange={(e) => onChange("employeeId", e.target.value)}
              placeholder="Enter Employee ID (e.g., VS-0001)"
            />
            {errors.employeeId && (
              <p className="text-xs text-red-600">{errors.employeeId}</p>
            )}
          </div> */}

          {/* Mobile */}
          <div>
            <Label>Mobile Number</Label>
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                onChange("mobile", value);
              }}
              placeholder="Enter 10-digit mobile number"
            />
            {errors.mobile && (
              <p className="text-xs text-red-600">{errors.mobile}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="Enter Email"
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          {mode === "edit" && (
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  placeholder="Enter Password"
                  className="pr-10"
                />

                {/* Eye Icon Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-red-600">{errors.password}</p>
              )}
            </div>
          )}

          {/* Branch Select */}
          <div>
            <Label>Office Branch</Label>
            <Select
              value={form.branchCode}
              onValueChange={(value) =>
                onChange("branchCode", value as BranchCode)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Office Branch" />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_OPTIONS.map((b) => (
                  <SelectItem key={b.code} value={b.code}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.branchCode && (
              <p className="text-xs text-red-600">{errors.branchCode}</p>
            )}
          </div>

          {/* Buttons */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
