"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useAdminUsers
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Custom command hook executing admin users operations.
 * 
 * WHY IT EXISTS:
 * Powers admin dashboards user profiles directory.
 * 
 * HOW IT WORKS (Technical Overview):
 * Wraps POST/PATCH/DELETE calls to users resources.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import {
  adminUsersApi,
  type AdminListUsersParams,
  type AdminCreateUserPayload,
  type AdminUpdateUserPayload,
} from "@/services/api";
import type { User, PaginationMeta } from "@/types/api-response";

export interface UseAdminUsersResult {
  users:      User[];
  pagination: PaginationMeta | null;
  isLoading:  boolean;
  error:      string | null;
  refetch:    () => void;
  create:     (payload: AdminCreateUserPayload) => Promise<{ user: User; tempPassword: string }>;
  update:     (id: string, payload: AdminUpdateUserPayload) => Promise<User>;
  remove:     (id: string) => Promise<void>;
  resetPassword: (id: string) => Promise<{ tempPassword: string }>;
}

export function useAdminUsers(params?: AdminListUsersParams): UseAdminUsersResult {
  const [users, setUsers]           = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    setIsLoading(true);
    setError(null);
    adminUsersApi
      .list(params)
      .then((res) => {
        setUsers(res.data);
        setPagination(res.pagination);
      })
      .catch((err: Error) => setError(err.message ?? "Failed to load users"))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const create = async (payload: AdminCreateUserPayload) => {
    const result = await adminUsersApi.create(payload);
    fetchUsers();
    return result;
  };

  const update = async (id: string, payload: AdminUpdateUserPayload) => {
    const result = await adminUsersApi.update(id, payload);
    fetchUsers();
    return result.user;
  };

  const remove = async (id: string) => {
    await adminUsersApi.remove(id);
    fetchUsers();
  };

  const resetPassword = async (id: string) => {
    return adminUsersApi.resetPassword(id);
  };

  return { users, pagination, isLoading, error, refetch: fetchUsers, create, update, remove, resetPassword };
}
