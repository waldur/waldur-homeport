import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { resolveTabValue } from 'waldur-ui';

interface UrlTabOptions {
  /**
   * `'replace'` (default) swaps the history entry, so Back leaves the page
   * rather than stepping through tabs; `'push'` adds one per tab switch.
   */
  history?: 'replace' | 'push';
}

/**
 * The open tab of a `Tabs` bar, kept in a URL query param when `param` is
 * given (`?tab=…`) and in local state otherwise. Keys are strings, as `Tabs`
 * values are. Falls back to the first tab when the URL names none or an
 * unknown one.
 *
 * The route must declare `param` dynamic, or every switch remounts the page;
 * `waldur-custom/dynamic-tab-params` checks this for `tab` and `*_tab`.
 *
 * ```tsx
 * const { activeKey, handleSelect } = useUrlTab(tabs, 'tab');
 * <Tabs value={activeKey} onValueChange={handleSelect}>…</Tabs>
 * ```
 */
export const useUrlTab = (
  tabs: ReadonlyArray<{ key: string }>,
  param?: string,
  { history = 'replace' }: UrlTabOptions = {},
) => {
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();

  const keys = useMemo(() => tabs.map((tab) => tab.key), [tabs]);
  const defaultActiveKey = keys[0];

  const urlValue = param ? params[param] : undefined;
  const urlKey = resolveTabValue(
    keys,
    urlValue != null ? String(urlValue) : undefined,
  );

  const [activeKey, setActiveKey] = useState(urlKey);

  // Follow the URL (Back/Forward, a link to another tab); an unknown or missing
  // value means the first tab.
  useEffect(() => {
    if (param) {
      setActiveKey(urlKey);
    }
  }, [param, urlKey]);

  const handleSelect = useCallback(
    (key: string) => {
      if (!key) {
        return;
      }
      setActiveKey(key);
      if (param) {
        router.stateService.go(
          state.name,
          { ...params, [param]: key },
          { location: history === 'replace' ? 'replace' : true },
        );
      }
    },
    [router, state, params, param, history],
  );

  // A tab that went away (a permission, a feature flag) must not leave the
  // bar with nothing open.
  return {
    activeKey: resolveTabValue(keys, activeKey),
    handleSelect,
    defaultActiveKey,
  };
};
