import { ENV } from '@/core/config';

import { DEFAULT_LAYOUT, LandingPageLayout, LAYOUT_OPTIONS } from './layouts';

function getConfiguredLayout(): LandingPageLayout {
  const configLayout = ENV.plugins.WALDUR_CORE.LOGIN_PAGE_LAYOUT;
  if (
    configLayout &&
    LAYOUT_OPTIONS.some((opt) => opt.value === configLayout)
  ) {
    return configLayout as LandingPageLayout;
  }
  return DEFAULT_LAYOUT;
}

export function useLayoutSwitcher() {
  const layout = getConfiguredLayout();
  return { layout };
}
