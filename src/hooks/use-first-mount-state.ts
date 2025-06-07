import { useRef } from "react";

export function useFirstMountState(): boolean {
  const isFirstMount = useRef(true);

  if (isFirstMount.current) {
    isFirstMount.current = false;
    return true;
  }

  return false;
}
