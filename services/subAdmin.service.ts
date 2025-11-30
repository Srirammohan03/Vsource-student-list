// src/services/subAdmin.service.ts
"use client";

import { SubAdmin } from "@/types/subAdmin";
import axios from "axios";

export const subAdminService = {
  list: async (): Promise<SubAdmin[]> => {
    const res = await axios.get("/api/users", {
      withCredentials: true,
    });
    return res.data.data;
  },

  create: async (data: any): Promise<SubAdmin> => {
    const res = await axios.post("/api/users", data, {
      withCredentials: true,
    });
    return res.data.data;
  },

  update: async (id: string, data: any): Promise<SubAdmin> => {
    const res = await axios.put(`/api/users/${id}`, data, {
      withCredentials: true,
    });
    return res.data.data;
  },

  delete: async (id: string): Promise<boolean> => {
    await axios.delete(`/api/users/${id}`, {
      withCredentials: true,
    });
    return true;
  },
};
