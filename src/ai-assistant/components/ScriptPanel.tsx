import { ArrowLineRightIcon } from '@phosphor-icons/react';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { BaseButton } from 'waldur-ui';

import { useDrawerExpanded } from '@/drawer/useDrawerExpanded';
import { translate } from '@/i18n';
import {
  HpcJobFile,
  HpcScriptViewer,
} from '@/marketplace/resources/details/hpc/HpcScriptViewer';

interface ScriptPanelEntry {
  /** The mounted card. */
  id: string;
  /**
   * The job the card shows. A card mounted again (another thread and back)
   * gets a new id but the same key, so it is not taken for a new card.
   */
  key: string;
  title: string;
  subtitle?: string;
  script: string;
  files?: HpcJobFile[];
}

interface ScriptPanelContextValue {
  /** The chat is full screen, so the panel has room beside it. */
  available: boolean;
  shown: ScriptPanelEntry | null;
  /** Adds the card's script, or updates it while the card streams. */
  register(entry: ScriptPanelEntry): void;
  unregister(id: string): void;
  show(key: string): void;
  close(): void;
}

const ScriptPanelContext = createContext<ScriptPanelContextValue | null>(null);

/** Null outside the assistant drawer, e.g. in the support logs. */
export const useScriptPanel = () => useContext(ScriptPanelContext);

/**
 * Job cards register their script here. Beside the full-screen chat the panel
 * shows the latest one, or the one picked with "View script", so a long script
 * no longer pushes the conversation off screen.
 */
export const ScriptPanelProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const available = useDrawerExpanded();
  const [entries, setEntries] = useState<ScriptPanelEntry[]>([]);
  const [pinnedKey, setPinnedKey] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  const registeredRef = useRef(new Set<string>());
  const seenKeysRef = useRef(new Set<string>());
  const register = useCallback((entry: ScriptPanelEntry) => {
    if (registeredRef.current.has(entry.id)) {
      setEntries((current) =>
        current.map((item) => (item.id === entry.id ? entry : item)),
      );
      return;
    }
    registeredRef.current.add(entry.id);
    setEntries((current) => [...current, entry]);
    if (!seenKeysRef.current.has(entry.key)) {
      // A job not shown before: show it, even after the panel was closed.
      seenKeysRef.current.add(entry.key);
      setPinnedKey(null);
      setClosed(false);
    }
  }, []);

  const unregister = useCallback((id: string) => {
    registeredRef.current.delete(id);
    setEntries((current) => current.filter((item) => item.id !== id));
  }, []);

  const show = useCallback((key: string) => {
    setPinnedKey(key);
    setClosed(false);
  }, []);

  const close = useCallback(() => setClosed(true), []);

  const shown = useMemo(
    () =>
      closed
        ? null
        : (entries.find((item) => item.key === pinnedKey) ??
          entries[entries.length - 1] ??
          null),
    [closed, entries, pinnedKey],
  );

  const value = useMemo(
    () => ({ available, shown, register, unregister, show, close }),
    [available, shown, register, unregister, show, close],
  );

  return (
    <ScriptPanelContext.Provider value={value}>
      {children}
    </ScriptPanelContext.Provider>
  );
};

export const ScriptPanel: FC = () => {
  const panel = useScriptPanel();
  if (!panel?.available || !panel.shown) {
    return null;
  }
  const { shown, close } = panel;
  return (
    <aside
      className="w-2/5 shrink-0 flex flex-col gap-3 p-4 border-l border-l-secondary bg-primary overflow-hidden"
      aria-label={translate('Job script')}
      data-testid="hpc-script-panel"
    >
      {/* Clear of the drawer's own expand and close buttons above. */}
      <div className="flex items-start gap-2 pe-20">
        <BaseButton
          iconNode={<ArrowLineRightIcon weight="bold" />}
          tooltip={translate('Hide script')}
          onClick={close}
          variant="tertiary-ghost"
          size="sm"
        />
        <div className="min-w-0">
          <div className="font-semibold text-primary wrap-anywhere">
            {shown.title}
          </div>
          {shown.subtitle && (
            <div className="text-tertiary text-xs wrap-anywhere">
              {shown.subtitle}
            </div>
          )}
        </div>
      </div>
      <HpcScriptViewer
        key={shown.id}
        script={shown.script}
        files={shown.files}
        height="calc(100vh - 230px)"
      />
    </aside>
  );
};
