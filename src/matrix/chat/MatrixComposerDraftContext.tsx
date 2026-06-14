import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface ComposerDraft {
  text: string;
  files: File[];
}

const EMPTY_DRAFT: ComposerDraft = { text: '', files: [] };

interface DraftContextValue {
  getDraft: (roomId: string | null) => ComposerDraft;
  setText: (roomId: string | null, text: string) => void;
  setFiles: (roomId: string | null, updater: (prev: File[]) => File[]) => void;
  clear: (roomId: string | null) => void;
}

// No-op default: the composer only renders when isMatrixChatEnabled(), the same
// gate that mounts the provider in MatrixRoot, so this default is never the live
// path. Kept (instead of throwing) to mirror MatrixCallPortalContext's
// safe-default convention.
const MatrixComposerDraftContext = createContext<DraftContextValue>({
  getDraft: () => EMPTY_DRAFT,
  setText: () => {},
  setFiles: () => {},
  clear: () => {},
});

export const MatrixComposerDraftProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [drafts, setDrafts] = useState<Record<string, ComposerDraft>>({});

  const getDraft = useCallback(
    (roomId: string | null) => (roomId && drafts[roomId]) || EMPTY_DRAFT,
    [drafts],
  );

  const setText = useCallback((roomId: string | null, text: string) => {
    if (!roomId) return;
    setDrafts((prev) => ({
      ...prev,
      [roomId]: { text, files: prev[roomId]?.files ?? [] },
    }));
  }, []);

  const setFiles = useCallback(
    (roomId: string | null, updater: (prev: File[]) => File[]) => {
      if (!roomId) return;
      setDrafts((prev) => ({
        ...prev,
        [roomId]: {
          text: prev[roomId]?.text ?? '',
          files: updater(prev[roomId]?.files ?? []),
        },
      }));
    },
    [],
  );

  const clear = useCallback((roomId: string | null) => {
    if (!roomId) return;
    setDrafts((prev) => {
      if (!prev[roomId]) return prev;
      const next = { ...prev };
      delete next[roomId];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ getDraft, setText, setFiles, clear }),
    [getDraft, setText, setFiles, clear],
  );

  return (
    <MatrixComposerDraftContext.Provider value={value}>
      {children}
    </MatrixComposerDraftContext.Provider>
  );
};

/**
 * Read/write the composer draft for a single room. setText/setFiles/clear keep
 * stable identity across draft changes (the provider's setters have empty deps),
 * so callers can list them in effect/callback deps without churn.
 */
export function useMatrixComposerDraft(roomId: string | null) {
  const { getDraft, setText, setFiles, clear } = useContext(
    MatrixComposerDraftContext,
  );
  return {
    draft: getDraft(roomId),
    setText: useCallback(
      (text: string) => setText(roomId, text),
      [setText, roomId],
    ),
    setFiles: useCallback(
      (updater: (prev: File[]) => File[]) => setFiles(roomId, updater),
      [setFiles, roomId],
    ),
    clear: useCallback(() => clear(roomId), [clear, roomId]),
  };
}
