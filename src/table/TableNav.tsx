import { useCurrentStateAndParams } from '@uirouter/react';
import { isMatch } from 'lodash-es';
import { useMemo } from 'react';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';

import { TableTab } from './types';

export const TableNav = ({ tabs }: { tabs: TableTab[] }) => {
  const { state, params } = useCurrentStateAndParams();

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

  // TabNav: this bar has no matching panel here — the active tab's panel is
  // rendered elsewhere by the router. It uses a <nav> with aria-current rather
  // than role="tab" with orphan aria-controls. Router tabs are real links, so
  // middle-click and "open in new tab" work; a tab with `onSelect` is local
  // state and stays a button.
  return (
    <TabNav
      activeKey={activeKey}
      className="min-w-0 flex-grow-1 pt-4"
      scrollable
      bordered={false}
      items={tabs.map((tab) =>
        tab.onSelect
          ? {
              key: tab.key,
              title: tab.title,
              onClick: () => tab.onSelect(tab.key),
            }
          : {
              key: tab.key,
              title: tab.title,
              link: (
                <Link state={tab.state ?? state.name} params={tab.params} />
              ),
            },
      )}
    />
  );
};
