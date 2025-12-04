"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ShieldAlert, Search, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@/types/loginLog";
import { toast } from "sonner";
import Error from "next/error";

export default function SecurityAlertPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["security-alerts"],
    queryFn: async () => {
      const { data } = await axios.get("/api/users?type=locked", {
        withCredentials: true,
      });
      return data;
    },
    staleTime: 0,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await axios.patch(
        `/api/users/unlock/${userId}`,
        {},
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: async (data) => {
      toast.success(data?.message ?? "User unlocked successfully");
      queryClient.invalidateQueries({ queryKey: ["security-alerts"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to unlock user");
    },
  });

  if (isError)
    return (
      <div className="p-6 text-red-600">
        {error?.message || "Failed to load audit logs"}
      </div>
    );

  if (isLoading)
    return (
      <div className="flex items-center gap-2 p-6">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        Loading...
      </div>
    );

  const filtered = data?.data?.filter(
    (u: User) =>
      u?.name?.toLowerCase()?.includes(search?.toLowerCase()) ||
      u?.email?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const handleResetLocked = async (id: string) => {
    mutate(id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-2xl font-semibold">Security Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Users who failed to login 5 consecutive times are temporarily
            locked. You can review and unlock them.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border">
        <CardHeader>
          <CardTitle>User Lockout List</CardTitle>
          <CardDescription>Monitor suspicious login activity</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No locked users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered?.map((u, idx) => (
                    <TableRow key={u?.id || idx}>
                      <TableCell className="font-medium">{u?.name}</TableCell>
                      <TableCell>{u?.email}</TableCell>
                      <TableCell>{u?.failedAttempts}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Locked</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleResetLocked(u?.id)}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Allow Login"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
