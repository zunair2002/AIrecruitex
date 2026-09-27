"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import {
  connectSocket,
  SERVER_EVENTS,
  type ServerEventName,
  type ServerEvents,
} from "@/lib/socket";

type Handler<E extends ServerEventName> = (payload: ServerEvents[E]) => void;

type RealtimeContextValue = {
  isConnected: boolean;
  /** Subscribes to one server event; returns an unsubscribe function. */
  subscribe: <E extends ServerEventName>(
    event: E,
    handler: Handler<E>,
  ) => () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

/**
 * Holds one socket connection for the signed-in user and fans its events out
 * to whichever screens are mounted.
 *
 * The socket itself is deliberately kept out of React state: components
 * subscribe to events rather than touching the connection, so a reconnect
 * never re-renders the whole tree.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(
    new Map<ServerEventName, Set<(payload: unknown) => void>>(),
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = connectSocket(userId);
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // One listener per event forwards to every subscriber, so mounting a
    // screen never adds a socket listener of its own.
    for (const event of SERVER_EVENTS) {
      socket.on(event, (payload: unknown) => {
        handlersRef.current.get(event)?.forEach((handler) => handler(payload));
      });
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [userId]);

  const subscribe = useCallback(
    <E extends ServerEventName>(event: E, handler: Handler<E>) => {
      const handlers = handlersRef.current;
      if (!handlers.has(event)) handlers.set(event, new Set());
      const set = handlers.get(event)!;
      const wrapped = handler as (payload: unknown) => void;
      set.add(wrapped);
      return () => {
        set.delete(wrapped);
      };
    },
    [],
  );

  const value = useMemo<RealtimeContextValue>(
    () => ({ isConnected, subscribe }),
    [isConnected, subscribe],
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}

function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used inside a <RealtimeProvider>");
  }
  return context;
}

export function useRealtimeConnected(): boolean {
  return useRealtime().isConnected;
}

/**
 * Runs `handler` whenever the server pushes `event`.
 *
 * The handler is held in a ref so passing an inline arrow doesn't resubscribe
 * on every render — callers can write `useServerEvent("x", () => reload())`.
 */
export function useServerEvent<E extends ServerEventName>(
  event: E,
  handler: Handler<E>,
): void {
  const { subscribe } = useRealtime();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(
    () => subscribe(event, (payload) => handlerRef.current(payload)),
    [event, subscribe],
  );
}

/** The three events that mean "one of my applications changed". */
export function useApplicationEvents(onChange: () => void): void {
  useServerEvent("application:status", onChange);
  useServerEvent("application:ai-interview-scheduled", onChange);
  useServerEvent("application:org-interview", onChange);
}
