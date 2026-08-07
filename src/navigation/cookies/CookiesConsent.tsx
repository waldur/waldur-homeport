import { useCurrentStateAndParams } from '@uirouter/react';
import { useState, FunctionComponent, useEffect } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { initMatomoTracker, MatomoInstance } from '@/core/matomo';
import { isFeatureVisible } from '@/features/connect';
import { DeploymentFeatures } from '@/FeaturesEnums';
import { useModal } from '@/modal/actions';

import { getConsent, setConsent } from './CookiesStorage';

const CookiesConsentDialog = lazyComponent(() =>
  import('./CookiesConsentDialog').then((module) => ({
    default: module.CookiesConsentDialog,
  })),
);

export const CookiesConsent: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();
  const { openDialog, closeDialog } = useModal();
  const [accepted, setAccepted] = useState(
    ['true', 'essential'].includes(getConsent()),
  );

  const hideConsent = (onlyEssential) => {
    setAccepted(true);
    setConsent(onlyEssential ? 'essential' : 'true');
    closeDialog();
    if (!onlyEssential && !MatomoInstance) {
      initMatomoTracker();
    }
  };

  useEffect(() => {
    if (state.name === 'about.privacy') return;
    if (
      !accepted &&
      isFeatureVisible(DeploymentFeatures.enable_cookie_notice)
    ) {
      openDialog(CookiesConsentDialog, {
        resolve: {
          acceptAll: () => hideConsent(false),
          acceptEssential: () => hideConsent(true),
        },
        backdrop: 'static',
      });
    }
  }, [accepted, state, openDialog, hideConsent]);

  return null;
};
