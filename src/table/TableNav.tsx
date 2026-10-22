import { useCurrentStateAndParams } from '@uirouter/react';
import { isMatch } from 'es-toolkit/compat';
import { MouseEvent, useLayoutEffect, useMemo, useRef } from 'react';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';

import { TableTab } from './types';

/**
 * A tab that links to another state swaps the whole page, this bar included:
 * the link the user just activated leaves the DOM and focus falls to <body>.
 * When the tab was activated from the keyboard or a screen reader, the bar
 * that mounts in its place, for the same set of tabs, hands focus to its
 * current tab, so the user stays in the tab row.
 */
let pendingFocus: { group: string; at: number } | null = null;

// Long enough for a page whose chunk is still downloading.
const FOCUS_HANDOFF_MS = 10_000;

export const TableNav = ({ tabs }: { tabs: TableTab[] }) => {
  const { state, params } = useCurrentStateAndParams();
  const navRef = useRef<HTMLElement>(null);
  const group = useMemo(() => tabs.map((tab) => tab.key).join('|'), [tabs]);

  const activeKey = useMemo(() => {
    // Local-state mode: caller marks one tab as active explicitly.
    const explicitlyActive = tabs.find((t) => t.active);
    if (explicitlyActive) {
      return explicitlyActive.key;
    }
    // URL-driven mode: find tab that matches current state and params
    const matchedTab = tabs.find(
      (t) =>
        (!t.state || t.state === state.name) &&
        (!t.params || isMatch(params, t.params)),
    );
    if (matchedTab) {
      return matchedTab.key;
    }
    // Fall back to default tab if no match found
    const defaultTab = tabs.find((t) => t.default);
    return defaultTab?.key;
  }, [state, params, tabs]);

  // Enter on a tab link, or a screen reader activating it: a click with no
  // pointer behind it (`detail` 0). A pointer click would get a focus ring
  // it never had; a modified click opens a new browser tab and leaves this
  // page as it is.
  const rememberActivation = (event: MouseEvent<HTMLElement>) => {
    if (
      event.detail !== 0 ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !(event.target as Element).closest('a')
    ) {
      return;
    }
    pendingFocus = { group, at: Date.now() };
  };

  // A bar that survives the switch (a tab that only changes a dynamic param)
  // still holds focus, and only clears the hand-off.
  useLayoutEffect(() => {
    if (pendingFocus?.group !== group) return;
    const expired = Date.now() - pendingFocus.at > FOCUS_HANDOFF_MS;
    pendingFocus = null;
    const focused = document.activeElement;
    if (expired || (focused && focused !== document.body)) return;
    navRef.current
      ?.querySelector<HTMLElement>('[aria-current]')
      ?.focus({ preventScroll: true });
  }, [group, activeKey]);

  // TabNav: this bar has no matching panel here — the active tab's panel is
  // rendered elsewhere by the router. It uses a <nav> with aria-current rather
  // than role="tab" with orphan aria-controls. Router tabs are real links, so
  // middle-click and "open in new tab" work; a tab with `onSelect` is local
  // state and stays a button.
  return (
    <TabNav
      ref={navRef}
      onClickCapture={rememberActivation}
      activeKey={activeKey}
      className="min-w-0 grow pt-4"
      scrollable
      bordered={false}
      items={tabs.map((tab) =>
        tab.onSelect
          ? {
              key: tab.key,
              title: tab.title,
              count: tab.count,
              onClick: () => tab.onSelect(tab.key),
            }
          : {
              key: tab.key,
              title: tab.title,
              count: tab.count,
              link: (
                <Link state={tab.state ?? state.name} params={tab.params} />
              ),
            },
      )}
    />
  );
};
