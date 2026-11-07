import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { overrideSettingsRetrieve, SettingSource } from 'waldur-js-client';

import { PropertyCard, PropertyList } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import {
  getDeploymentLockedKeys,
  getDeploymentLockedReason,
} from '@/matrix/useMatrixAppserviceStatus';
import { NoResult } from '@/navigation/header/search/NoResult';
import { SettingsDescription } from '@/SettingsDescription';

import { FieldRow } from './FieldRow';
import { useSettingSources } from './useSettingSources';
import { isSettingModified } from './utils';

const ITEMS: Record<string, any> = {};
for (const group of SettingsDescription) {
  for (const item of group.items) {
    ITEMS[item.key] = item;
  }
}

// A setting is listed under the first group it matches.
const GROUPS: {
  title: () => string;
  matches: (s: SettingSource) => boolean;
}[] = [
  {
    title: () => translate('Managed by deployment'),
    matches: (s) => s.locked,
  },
  {
    // Not locked, but the next deploy writes them again.
    title: () => translate('Re-applied by deployment'),
    matches: (s) => Boolean(s.managed_by),
  },
  {
    // Seeded: the administrators' to change.
    title: () => translate('Set by deployment'),
    matches: (s) => s.source === 'deployment',
  },
  {
    title: () => translate('Changed by administrators'),
    matches: (s) => s.source === 'api' || s.source === 'admin',
  },
  {
    title: () => translate('Set by management commands'),
    matches: (s) => s.source === 'cli',
  },
  {
    title: () => translate('Set by Waldur'),
    matches: (s) => s.source === 'application',
  },
  {
    // Values administrators had set before the settings store replaced it.
    title: () => translate('Carried over from django-constance'),
    matches: (s) => s.source === 'migration',
  },
];

const provenance = (source: SettingSource) =>
  [
    source.updated_by_username,
    source.managed_by || source.source_detail,
    formatDateTime(source.updated_at),
  ]
    .filter(Boolean)
    .join(' · ');

/** Every setting that no longer has its default, grouped by who set it. */
export const SettingsOverrides = () => {
  const router = useRouter();
  const sources = useSettingSources();
  const values = useQuery({
    queryKey: ['SettingsOverrides'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  if (sources.isLoading || values.isLoading) return <LoadingSpinner />;
  if (sources.error || values.error)
    return (
      <LoadingErred
        message={translate('Unable to load settings.')}
        loadData={() => {
          sources.refetch();
          values.refetch();
        }}
      />
    );

  // A key no longer described is a leftover the UI cannot render. A locked
  // setting is shown even at its default: the deployment still manages it.
  const rows = Object.values(sources.data ?? {}).filter(
    (source) =>
      ITEMS[source.key] &&
      (source.locked ||
        isSettingModified(ITEMS[source.key], values.data?.[source.key])),
  );
  if (!rows.length)
    return (
      <NoResult
        title={translate('No overridden settings')}
        message={translate('Every setting has its default value.')}
        buttonTitle={translate('Open branding settings')}
        callback={() => router.stateService.go('admin-branding')}
      />
    );

  const groupOf = (source: SettingSource) =>
    GROUPS.find((group) => group.matches(source));
  // The rule of the Matrix tab, so this page cannot change what it blocks.
  const matrixLocked = getDeploymentLockedKeys(values.data ?? {});

  return (
    <>
      {GROUPS.map((group) => {
        const matching = rows.filter((source) => groupOf(source) === group);
        if (!matching.length) return null;
        return (
          <PropertyCard
            key={group.title()}
            title={group.title()}
            bordered
            className="mb-4"
          >
            <PropertyList>
              {matching.map((source) => (
                <FieldRow
                  key={source.key}
                  item={{
                    ...ITEMS[source.key],
                    description: [
                      ITEMS[source.key].description,
                      provenance(source),
                    ]
                      .filter(Boolean)
                      .join(' — '),
                  }}
                  value={values.data?.[source.key]}
                  showSource={false}
                  editDisabledReason={
                    matrixLocked.includes(source.key)
                      ? getDeploymentLockedReason()
                      : undefined
                  }
                />
              ))}
            </PropertyList>
          </PropertyCard>
        );
      })}
    </>
  );
};
