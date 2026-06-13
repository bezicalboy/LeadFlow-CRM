import { trpc } from "@/providers/trpc";
import { getQueryKey } from "@trpc/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { LOGIN_PATH } from "@/const";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

const authMeQueryKey = getQueryKey(trpc.auth.me, undefined, "query");

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } =
    options ?? {};

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 0,
    retry: false,
  });

  const clearAuthCache = useCallback(() => {
    void utils.auth.me.cancel();
    queryClient.removeQueries({ queryKey: authMeQueryKey });
  }, [queryClient, utils]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onMutate: () => {
      clearAuthCache();
    },
    onSuccess: () => {
      navigate(redirectPath, { replace: true });
    },
    onError: () => {
      void utils.auth.me.invalidate();
    },
  });

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  useEffect(() => {
    const currentUser = error ? null : (user ?? null);
    if (redirectOnUnauthenticated && !isLoading && !currentUser) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [redirectOnUnauthenticated, isLoading, user, error, navigate, redirectPath]);

  return useMemo(
    () => ({
      user: error ? null : (user ?? null),
      isAuthenticated: !error && !!user,
      isLoading: isLoading || logoutMutation.isPending,
      error,
      logout,
      refresh: refetch,
    }),
    [user, error, isLoading, logoutMutation.isPending, logout, refetch],
  );
}
