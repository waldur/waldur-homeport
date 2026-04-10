import { useCallback, useRef, useState } from 'react';

export const useAbortControllers = () => {
  const [abortControllers, setAbortControllers] = useState<
    Map<string, AbortController>
  >(new Map());

  const createController = (threadId: string) => {
    const controller = new AbortController();
    setAbortControllers((prev) => new Map(prev).set(threadId, controller));
    return controller;
  };

  const abortThread = (threadId: string) => {
    const controller = abortControllers.get(threadId);
    if (controller) {
      controller.abort();
      setAbortControllers((prev) => {
        const next = new Map(prev);
        next.delete(threadId);
        return next;
      });
    }
  };

  const cleanupController = (threadId: string) => {
    setAbortControllers((prev) => {
      const next = new Map(prev);
      next.delete(threadId);
      return next;
    });
  };

  return { createController, abortThread, cleanupController };
};

export const useBackendThreadIds = () => {
  // Ref-backed: the mapping is never read for rendering, only looked up by
  // message handlers. Using a ref keeps getter/setter identities stable so
  // downstream memos (e.g. threadListAdapter) don't rebuild on every message.
  const backendThreadIdsRef = useRef<Map<string, string>>(new Map());

  const getBackendThreadId = useCallback(
    (threadId: string) => backendThreadIdsRef.current.get(threadId),
    [],
  );

  const setBackendThreadId = useCallback((threadId: string, uuid: string) => {
    if (backendThreadIdsRef.current.get(threadId) === uuid) return;
    backendThreadIdsRef.current.set(threadId, uuid);
  }, []);

  return { getBackendThreadId, setBackendThreadId };
};
