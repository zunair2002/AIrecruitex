"use client";

import { useCallback, useEffect, useState } from "react";
import { isAbortError, toErrorMessage } from "./api";

type Loader<T> = (signal: AbortSignal) => Promise<T>;

export type ApiResource<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  /** Re-runs the loader (e.g. after a mutation). */
  reload: () => void;
  /** Applies a local change without a round trip. */
  setData: (updater: T | ((current: T | null) => T | null)) => void;
};

type State<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
};

/**
 * Runs `loader` on mount and whenever `deps` change, cancelling the in-flight
 * request on unmount so a slow response can't set state after teardown.
 *
 * Every screen fetches through this one hook, so the "flip to loading, then
 * settle" transition — which React's lint flags as a synchronous setState in an
 * effect — lives here once instead of being repeated in each component.
 */
export function useApiResource<T>(
  loader: Loader<T>,
  deps: unknown[],
  options: { enabled?: boolean } = {},
): ApiResource<T> {
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<State<T>>({
    data: null,
    error: null,
    isLoading: enabled,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) {
      // Settle the initial loading flag when the resource is gated off,
      // e.g. before an auth token exists.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((current) => ({ ...current, isLoading: false }));
      return;
    }

    const controller = new AbortController();
    // Entering the loading state is the point of this effect — the request
    // starts on the same tick.
    setState((current) => ({ ...current, error: null, isLoading: true }));

    loader(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setState({ data: result, error: null, isLoading: false });
      })
      .catch((error) => {
        if (isAbortError(error) || controller.signal.aborted) return;
        setState((current) => ({
          ...current,
          error: toErrorMessage(error),
          isLoading: false,
        }));
      });

    return () => controller.abort();
    // `loader` is recreated on every render by design — the caller declares the
    // values it actually depends on through `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reloadKey, ...deps]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const setData = useCallback(
    (updater: T | ((current: T | null) => T | null)) => {
      setState((current) => ({
        ...current,
        data:
          typeof updater === "function"
            ? (updater as (c: T | null) => T | null)(current.data)
            : updater,
      }));
    },
    [],
  );

  return { ...state, reload, setData };
}

/**
 * Picks the currently selected item from a list without storing a copy of the
 * list in state: an explicit choice wins while it's still present, otherwise
 * the first item is used. Avoids the "reset selection when data arrives"
 * effect that every list-plus-detail screen would otherwise need.
 */
export function resolveSelection<T>(
  items: T[],
  selectedId: string | null,
  getId: (item: T) => string,
): T | null {
  if (items.length === 0) return null;
  if (selectedId) {
    const found = items.find((item) => getId(item) === selectedId);
    if (found) return found;
  }
  return items[0];
}
