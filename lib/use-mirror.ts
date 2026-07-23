"use client";

import { useState } from "react";

/**
 * Local mirror of server-provided data, for optimistic UI.
 *
 * Components render from the returned local state so edits show
 * instantly, then call the setter to apply an optimistic change and
 * fire the mutation in the background. When the server sends fresh
 * props (after router.refresh()), the mirror resyncs to server truth
 * during render — no effect, no flash. On a failed mutation, pass the
 * original server value back to the setter to roll back.
 */
export function useMirror<T>(serverValue: T): [T, (next: T) => void] {
  const [value, setValue] = useState(serverValue);
  const [prev, setPrev] = useState(serverValue);
  if (serverValue !== prev) {
    setPrev(serverValue);
    setValue(serverValue);
  }
  return [value, setValue];
}
