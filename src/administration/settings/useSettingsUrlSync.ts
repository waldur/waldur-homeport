import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface TabDefinition {
  key: string;
}

export const useSettingsUrlSync = <T extends TabDefinition>(
  tabs: T[],
  syncKey = 'tab',
) => {
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();

  const defaultActiveKey = useMemo(() => tabs[0]?.key, [tabs]);

  const [activeKey, setActiveKey] = useState<string>(
    defaultActiveKey || tabs[0]?.key,
  );

  // Sync activeKey with URL query
  useEffect(() => {
    const urlKey = params[syncKey];
    if (urlKey && tabs.some((tab) => tab.key === urlKey)) {
      setActiveKey(urlKey);
    } else if (defaultActiveKey) {
      setActiveKey(defaultActiveKey);
    }
  }, [params, syncKey, tabs, defaultActiveKey]);

  const handleSelect = useCallback(
    (key: string | null) => {
      if (key) {
        setActiveKey(key);
        router.stateService.go(
          state.name,
          { ...params, [syncKey]: key },
          { location: 'replace' },
        );
      }
    },
    [router, state, params, syncKey],
  );

  return { activeKey, handleSelect, defaultActiveKey, params, state, router };
};
