import { useMemo } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

import { SettingsGroupTab } from '../settings/SettingsGroupTab';

const ProjectTab = () => (
  <SettingsGroupTab groupNames={[translate('Project')]} />
);

const ProjectDigestTab = () => (
  <SettingsGroupTab groupNames={[translate('Project Digest')]} />
);

// The onboarding tab replaces the standalone page's `show_onboarding` feature
// gate; the project settings have none.
const ONBOARDING_TAB = {
  key: 'onboarding',
  title: translate('Onboarding'),
  component: lazyComponent(() =>
    import('../organizations/OnboardingSettings').then((module) => ({
      default: module.OnboardingSettings,
    })),
  ),
};

const PROJECT_TABS = [
  { key: 'project', title: translate('Project'), component: ProjectTab },
  {
    key: 'project-digest',
    title: translate('Project digest'),
    component: ProjectDigestTab,
  },
];

export const OrganizationProjectSettingsPage = () => {
  // Feature flags are deployment config, fixed for the page's lifetime, so the
  // list is built once; a stable identity also keeps TableWithTabs from
  // re-syncing the active tab on every render.
  const tabs = useMemo(
    () =>
      isFeatureVisible(CustomerFeatures.show_onboarding)
        ? [ONBOARDING_TAB, ...PROJECT_TABS]
        : PROJECT_TABS,
    [],
  );

  return (
    <TableWithTabs
      title={translate('Organization & project settings')}
      subtitle={translate(
        'How new organizations are onboarded and how projects behave.',
      )}
      tabs={tabs}
      syncWithUrlKey="tab"
    />
  );
};
