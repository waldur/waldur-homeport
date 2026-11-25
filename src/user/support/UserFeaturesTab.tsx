import { useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import {
  User,
  UserFeatureState,
  usersFeaturesRetrieve,
} from 'waldur-js-client';

import { Badge, Switch } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';

const SourceBadge: FC<{ state: UserFeatureState }> = ({ state }) => {
  if (state.source === 'global') {
    return (
      <Badge variant="success" size="sm" tone="outline">
        {translate('On for everyone')}
      </Badge>
    );
  }
  if (state.source === 'rule') {
    return (
      <Badge variant="primary" size="sm" tone="outline">
        {translate('On through rules ({count})', {
          count: state.rules.length,
        })}
      </Badge>
    );
  }
  return (
    <Badge variant="neutral" size="sm" tone="outline">
      {translate('Off')}
    </Badge>
  );
};

/**
 * Which feature flags and micro-apps are on for a user, and why: on for
 * everyone, through feature rules that match the user, or off.
 */
export const UserFeaturesTab: FC<{ user: User }> = ({ user }) => {
  const [onlyEnabled, setOnlyEnabled] = useState(true);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-features', user.uuid],
    queryFn: async () =>
      (await usersFeaturesRetrieve({ path: { uuid: user.uuid } })).data,
  });
  const features = useMemo(
    () =>
      (data?.features ?? []).filter((state) => !onlyEnabled || state.enabled),
    [data, onlyEnabled],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) {
    return (
      <LoadingErred
        message={translate('Unable to load the features of this user.')}
        loadData={refetch}
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <Switch
        checked={onlyEnabled}
        onCheckedChange={setOnlyEnabled}
        label={translate('Only features that are on')}
      />
      <SimpleTable<UserFeatureState>
        rows={features}
        rowKey="key"
        columns={[
          { title: translate('Feature'), render: ({ row }) => <>{row.key}</> },
          {
            title: translate('Scope'),
            render: ({ row }) =>
              row.scope === 'user'
                ? translate('Can be targeted')
                : translate('Whole portal'),
          },
          {
            title: translate('Value'),
            render: ({ row }) => <SourceBadge state={row} />,
          },
        ]}
      />
      {data.micro_apps.length ? (
        <>
          <h6 className="mb-0">{translate('Micro-apps with a setting')}</h6>
          <SimpleTable
            rows={data.micro_apps}
            rowKey="name"
            columns={[
              { title: translate('App'), render: ({ row }) => <>{row.name}</> },
              {
                title: translate('Offered'),
                render: ({ row }) =>
                  row.enabled ? (
                    <Badge variant="success" size="sm" tone="outline">
                      {translate('Yes')}
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm" tone="outline">
                      {translate('No')}
                    </Badge>
                  ),
              },
            ]}
          />
        </>
      ) : null}
    </div>
  );
};
