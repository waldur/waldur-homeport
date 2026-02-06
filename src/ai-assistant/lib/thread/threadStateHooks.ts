import { useState } from 'react';

export const useThreadRunningState = () => {
  const [runningThreads, setRunningThreads] = useState<Map<string, boolean>>(
    new Map(),
  );

  const getIsRunning = (threadId: string) =>
    runningThreads.get(threadId) ?? false;

  const setIsRunning = (
    threadId: string,
    value: boolean | ((prev: boolean) => boolean),
  ) => {
    setRunningThreads((prev) => {
      const next = new Map(prev);
      const currentRunning = prev.get(threadId) ?? false;
      const newValue =
        typeof value === 'function' ? value(currentRunning) : value;
      next.set(threadId, newValue);
      return next;
    });
  };

  return { getIsRunning, setIsRunning };
};

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
  const [backendThreadIds, setBackendThreadIds] = useState<Map<string, string>>(
    new Map(),
  );

  const getBackendThreadId = (threadId: string) =>
    backendThreadIds.get(threadId);

  const setBackendThreadId = (threadId: string, uuid: string) => {
    setBackendThreadIds((prev) => new Map(prev).set(threadId, uuid));
  };

  return { getBackendThreadId, setBackendThreadId };
};
