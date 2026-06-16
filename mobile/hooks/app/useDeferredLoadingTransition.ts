import { useEffect, useRef } from "react";
import { InteractionManager } from "react-native";

const DEFAULT_LOADING_DISMISS_DELAY_MS = 100;

/**
 * Defers follow-up native work until after LoadingOverlay has had a frame to
 * unmount. This avoids Android Fabric reparenting crashes when replacing a
 * loader Modal with another Modal or a navigation transition.
 */
export function useDeferredLoadingTransition(
  delayMs: number = DEFAULT_LOADING_DISMISS_DELAY_MS
) {
  const pendingInteractionRef = useRef<ReturnType<
    typeof InteractionManager.runAfterInteractions
  > | null>(null);
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingTransition = () => {
    pendingInteractionRef.current?.cancel();
    pendingInteractionRef.current = null;

    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
  };

  const runAfterLoadingHidden = (callback: () => void) => {
    cancelPendingTransition();
    pendingInteractionRef.current = InteractionManager.runAfterInteractions(
      () => {
        pendingInteractionRef.current = null;
        pendingTimeoutRef.current = setTimeout(() => {
          pendingTimeoutRef.current = null;
          callback();
        }, delayMs);
      }
    );
  };

  useEffect(() => cancelPendingTransition, []);

  return runAfterLoadingHidden;
}
