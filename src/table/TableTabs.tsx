import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { isMatch } from 'lodash-es';
import { useMemo } from 'react';
import { Nav } from 'react-bootstrap';

import { TableTab } from './types';

export const TableTabs = ({ tabs }: { tabs: TableTab[] }) => {
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();
  const goTo = (key) => {
    const tab = tabs.find((t) => t.key === key);
    if (tab.onSelect) {
      tab.onSelect(String(key));
      return;
    }
    router.stateService.go(tab.state ?? state.name, tab.params);
  };

  const activeKey = useMemo(() => {
    // Local-state mode: caller marks one tab as active explicitly.
    const explicitlyActive = tabs.find((t) => t.active);
    if (explicitlyActive) {
      return explicitlyActive.key;
    }
    // URL-driven mode: find tab that matches current state and params
    const matchedTab = tabs.find(
      (t) => (!t.state || t.state === state.name) && isMatch(params, t.params),
    );
    if (matchedTab) {
      return matchedTab.key;
    }
    // Fall back to default tab if no match found
    const defaultTab = tabs.find((t) => t.default);
    return defaultTab?.key;
  }, [state, params, tabs]);

  return (
    <div className="overflow-autoo flex-grow-1 pb-2 pt-4">
      {/* Plain Nav, not Tab.Container: this bar has no matching Tab.Content —
          the active tab's panel is rendered elsewhere by the router. Wrapping
          it in Tab.Container would make react-bootstrap emit a `role="tab"` /
          `aria-controls` pair pointing at a tabpanel id that never exists. */}
      <Nav
        variant="tabs"
        className="nav-line-tabs flex-nowrap mx-0"
        activeKey={activeKey}
        onSelect={goTo}
      >
        {tabs.map((tab) => (
          <Nav.Item key={tab.key} className="text-nowrap">
            <Nav.Link as="button" eventKey={tab.key}>
              {tab.title}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
};
