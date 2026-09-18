import { GearSixIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { AlertItem, Badge } from 'waldur-ui';

import { getKeyTitle } from '@/administration/settings/utils';
import { ENV } from '@/core/config';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SettingsDescription } from '@/SettingsDescription';
import { renderFieldOrDash } from '@/table/utils';

/** The settings the SRAM integration reads, all in the SCIM settings group. */
export const SRAM_SETTING_KEYS = [
  'SRAM_INTEGRATION_ENABLED',
  'SCIM_INBOUND_ENABLED',
  'SRAM_PLACEHOLDER_ROLE_TEMPLATE',
  'SCIM_USER_MATCH_WALDUR_ATTRIBUTE',
  'SCIM_USER_MATCH_SCIM_ATTRIBUTE',
] as const;

const findSetting = (key: string) => {
  for (const group of SettingsDescription) {
    const item = group.items.find((candidate) => candidate.key === key);
    if (item) return item;
  }
  return undefined;
};

const renderValue = (key: string, value: unknown): ReactNode => {
  const item = findSetting(key);
  if (item?.type === 'boolean') {
    return value ? (
      <Badge variant="success" shape="pill" tone="outline">
        {translate('Enabled')}
      </Badge>
    ) : (
      <Badge variant="neutral" shape="pill" tone="outline">
        {translate('Disabled')}
      </Badge>
    );
  }
  if (key === 'SRAM_PLACEHOLDER_ROLE_TEMPLATE') {
    if (!value) {
      return (
        <span className="text-muted">
          {translate('Not set: placeholder roles carry no permissions.')}
        </span>
      );
    }
    const role = ENV.roles.find((candidate) => candidate.name === value);
    return role?.description && role.description !== value
      ? `${role.description} (${value})`
      : String(value);
  }
  const option = (
    item as { options?: { value: string; label: string }[] }
  )?.options?.find((candidate) => candidate.value === value);
  return renderFieldOrDash(option?.label ?? (value as string));
};

/**
 * Read-only summary of the settings the SRAM integration depends on. They are
 * edited on the SCIM tab of the identity settings, which renders the whole
 * group; this tab only links there.
 */
export const SramSettingsTab: FC = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['SramSettingsSummary'],
    queryFn: () => overrideSettingsRetrieve().then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load settings.')}
        loadData={refetch}
      />
    );
  }

  const settings = (data ?? {}) as Record<string, unknown>;

  return (
    <div className="pt-5">
      {!settings.SCIM_INBOUND_ENABLED && (
        <AlertItem
          variant="warning"
          className="mb-5"
          title={translate('Inbound SCIM is disabled')}
          body={translate(
            'SRAM cannot push collaborations or members until SCIM_INBOUND_ENABLED is on.',
          )}
        />
      )}
      <FormTable.Card
        title={translate('SCIM and SRAM settings')}
        className="card-bordered"
        actions={
          <Link
            state="admin-identity"
            params={{ tab: 'scim' }}
            className="btn btn-tertiary btn-sm"
          >
            <GearSixIcon weight="bold" className="me-2" />
            {translate('Edit in SCIM settings')}
          </Link>
        }
      >
        <FormTable>
          {SRAM_SETTING_KEYS.map((key) => (
            <FormTable.Item
              key={key}
              label={getKeyTitle(key)}
              description={findSetting(key)?.description}
              value={renderValue(key, settings[key])}
            />
          ))}
        </FormTable>
      </FormTable.Card>
    </div>
  );
};
