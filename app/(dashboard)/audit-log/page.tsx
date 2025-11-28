"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";
import { User } from "@/types/loginLog";

type AuditLog = {
  id: string;
  userId: string | null;
  role: string | null;
  module: string;
  recordId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  oldValues: any;
  newValues: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: User;
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/audit")
      .then((res) => res.json())
      .then((data) => setLogs(data.data))
      .catch((err) => console.error("Error fetching audit logs:", err));
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.module.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.role?.toLowerCase().includes(search.toLowerCase()) ||
      log.userId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="p-6 m-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Audit Logs</h2>
        <Input
          placeholder="Search by user, role, action, module..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72"
        />
      </div>

      <Separator className="mb-4" />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>User Agent</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <>
                <TableRow key={log?.id}>
                  <TableCell>{log?.user.name || "System"}</TableCell>
                  <TableCell>{log?.user.email || "System"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log?.role || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>{log?.module}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log?.action === "CREATE"
                          ? "default"
                          : log?.action === "UPDATE"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {log?.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log?.ipAddress}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log?.userAgent}
                  </TableCell>
                  <TableCell>
                    {new Date(log?.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => toggleExpand(log?.id)}
                      className="flex items-center gap-2"
                    >
                      {expandedRow === log?.id ? "Hide" : "Show"}
                      {expandedRow === log?.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>

                {expandedRow === log?.id && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-muted p-4">
                      <div className="grid grid-cols-3 gap-4">
                        {/* Field Name */}
                        <div>
                          <h3 className="font-medium mb-2">Field</h3>
                          {Object.keys({
                            ...log?.oldValues,
                            ...log?.newValues,
                          }).map((field) => (
                            <p key={field} className="text-sm py-1 border-b">
                              {field}
                            </p>
                          ))}
                        </div>

                        {/* Old Values */}
                        <div>
                          <h3 className="font-medium mb-2 text-red-600">
                            Old Value
                          </h3>
                          {Object.keys({
                            ...log?.oldValues,
                            ...log?.newValues,
                          }).map((field) => {
                            const oldValue = log?.oldValues?.[field];
                            const newValue = log?.newValues?.[field];
                            const changed = oldValue !== newValue;

                            return (
                              <p
                                key={field}
                                className={`text-sm py-1 border-b ${
                                  changed
                                    ? "text-red-600 font-medium"
                                    : "text-gray-500"
                                }`}
                              >
                                {oldValue !== undefined
                                  ? String(oldValue)
                                  : "--"}
                              </p>
                            );
                          })}
                        </div>

                        {/* New Values */}
                        <div>
                          <h3 className="font-medium mb-2 text-green-600">
                            New Value
                          </h3>
                          {Object.keys({
                            ...log?.oldValues,
                            ...log?.newValues,
                          }).map((field) => {
                            const oldValue = log?.oldValues?.[field];
                            const newValue = log?.newValues?.[field];
                            const changed = oldValue !== newValue;

                            return (
                              <p
                                key={field}
                                className={`text-sm py-1 border-b ${
                                  changed
                                    ? "text-green-600 font-semibold"
                                    : "text-gray-500"
                                }`}
                              >
                                {newValue !== undefined
                                  ? String(newValue)
                                  : "--"}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
