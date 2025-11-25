// src/services/subAdmin.service.ts
"use client";

import { SubAdmin } from "@/types/subAdmin";

const STORAGE_KEY = "vsource_sub_admins";

function readFromStorage(): SubAdmin[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SubAdmin[];
  } catch {
    return [];
  }
}

function writeToStorage(items: SubAdmin[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const subAdminService = {
  async getAll(): Promise<SubAdmin[]> {
    return readFromStorage();
  },

  async create(
    payload: Omit<SubAdmin, "id" | "createdAt">
  ): Promise<SubAdmin> {
    const list = readFromStorage();
    const newItem: SubAdmin = {
      ...payload,
      id: `SA-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    list.push(newItem);
    writeToStorage(list);
    return newItem;
  },

  async update(
    id: string,
    changes: Partial<Omit<SubAdmin, "id" | "createdAt">>
  ): Promise<SubAdmin | null> {
    const list = readFromStorage();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const updated: SubAdmin = { ...list[index], ...changes };
    list[index] = updated;
    writeToStorage(list);
    return updated;
  },

  async remove(id: string): Promise<void> {
    const list = readFromStorage();
    const filtered = list.filter((s) => s.id !== id);
    writeToStorage(filtered);
  }
};
