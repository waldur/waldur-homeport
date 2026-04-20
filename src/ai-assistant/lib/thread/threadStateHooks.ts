import { useState } from 'react';

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
