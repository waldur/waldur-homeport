import { useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PANELS_PARAM = 'panels';

// Update URL without triggering UIRouter state transition
const updateUrlParam = (paramName: string, value: string) => {
  const url = new URL(window.location.href);
  if (value === '') {
    url.searchParams.set(paramName, '');
  } else {
    url.searchParams.set(paramName, value);
  }
  window.history.replaceState(null, '', url.toString());
};

/**
 * Hook to manage accordion panel open/closed state via URL query parameters.
 * This allows the accordion state to survive page refreshes and enables deep linking.
 *
 * @param panelIds - Array of panel IDs that can be toggled
 * @param defaultOpenPanels - Array of panel IDs that should be open by default (when no URL param exists)
 * @returns Object with openPanels set and toggle/check functions
 *
 * @example
 * ```tsx
 * const { isPanelOpen, togglePanel } = useAccordionUrlState(
 *   ['step-project', 'step-compliance', 'step-team'],
 *   ['step-project'] // step-project open by default
 * );
 *
 * <AccordionCard
 *   id="step-project"
 *   isOpen={isPanelOpen('step-project')}
 *   onToggle={(isOpen) => togglePanel('step-project', isOpen)}
 * />
 * ```
 */
export const useAccordionUrlState = (
  panelIds: string[],
  defaultOpenPanels: string[] = [],
) => {
  const { params } = useCurrentStateAndParams();

  // Parse initial open panels from URL or use defaults
  const initialOpenPanels = useMemo((): Set<string> => {
    // Read from URL directly for initial state
    const urlParams = new URLSearchParams(window.location.search);
    const panelsParam = urlParams.get(PANELS_PARAM) ?? params[PANELS_PARAM];

    if (panelsParam === undefined || panelsParam === null) {
      // No param in URL - use defaults
      return new Set(defaultOpenPanels);
    }

    if (panelsParam === '') {
      // Empty param means all closed
      return new Set<string>();
    }

    // Parse comma-separated panel IDs, filtering to valid ones
    const parsedPanels = (panelsParam as string)
      .split(',')
      .filter((id) => panelIds.includes(id));
    return new Set(parsedPanels);
  }, []);

  // Use local state for open panels to avoid re-renders from URL changes
  const [openPanels, setOpenPanels] = useState<Set<string>>(initialOpenPanels);

  // Track previous panelIds to detect newly added panels
  const prevPanelIdsRef = useRef<string[]>([]);

  // Re-sync from URL when new panel IDs are added (e.g., compliance step loads async)
  useEffect(() => {
    const prevPanelIds = prevPanelIdsRef.current;
    const newPanelIds = panelIds.filter((id) => !prevPanelIds.includes(id));

    if (newPanelIds.length > 0) {
      // Check URL for any newly available panels that should be open
      const urlParams = new URLSearchParams(window.location.search);
      const panelsParam = urlParams.get(PANELS_PARAM);

      if (panelsParam) {
        const urlPanels = panelsParam.split(',');
        const panelsToAdd = newPanelIds.filter((id) => urlPanels.includes(id));

        if (panelsToAdd.length > 0) {
          setOpenPanels((prev) => {
            const updated = new Set(prev);
            panelsToAdd.forEach((id) => updated.add(id));
            return updated;
          });
        }
      }
    }

    prevPanelIdsRef.current = panelIds;
  }, [panelIds]);

  // Check if a specific panel is open
  const isPanelOpen = useCallback(
    (panelId: string): boolean => {
      return openPanels.has(panelId);
    },
    [openPanels],
  );

  // Toggle a panel's open state
  const togglePanel = useCallback((panelId: string, isOpen: boolean) => {
    setOpenPanels((prev) => {
      const newOpenPanels = new Set(prev);

      if (isOpen) {
        newOpenPanels.add(panelId);
      } else {
        newOpenPanels.delete(panelId);
      }

      const newPanelsValue =
        newOpenPanels.size === 0 ? '' : Array.from(newOpenPanels).join(',');

      updateUrlParam(PANELS_PARAM, newPanelsValue);

      return newOpenPanels;
    });
  }, []);

  // Set multiple panels at once
  const setPanels = useCallback(
    (panelIdsToOpen: string[]) => {
      const validPanels = panelIdsToOpen.filter((id) => panelIds.includes(id));
      const newPanelsValue =
        validPanels.length === 0 ? '' : validPanels.join(',');

      setOpenPanels(new Set(validPanels));
      updateUrlParam(PANELS_PARAM, newPanelsValue);
    },
    [panelIds],
  );

  return {
    openPanels,
    isPanelOpen,
    togglePanel,
    setPanels,
  };
};
