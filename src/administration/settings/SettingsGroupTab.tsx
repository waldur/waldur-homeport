import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { SettingsCard } from './SettingsCard';

/**
 * Constance setting groups shown as one tab of a TableWithTabs page. `pt-5`
 * keeps the first card off the tab strip.
 */
export const SettingsGroupTab: FC<{ groupNames: string[] }> = ({
  groupNames,
}) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['SettingsGroupTab'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load settings.')}
        loadData={refetch}
      />
    );

  return data ? (
    <div className="pt-5">
      <SettingsCard groupNames={groupNames} settingsSource={data} />
    </div>
  ) : null;
};
