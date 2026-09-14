import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { RoleHygieneFindingSeverityEnum } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { getRoleHygieneReport } from '../../api';

import { RoleHygieneSummary } from './RoleHygieneSummary';
import { RoleHygieneTable } from './RoleHygieneTable';

export const RoleHygienePage = () => {
  const [severity, setSeverity] = useState<
    RoleHygieneFindingSeverityEnum | undefined
  >();

  const { isLoading, error, data, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['RoleHygieneReport'],
    queryFn: getRoleHygieneReport,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return (
      <LoadingErred
        message={translate('Unable to load the role hygiene report.')}
        loadData={refetch}
      />
    );
  }

  return (
    <>
      <RoleHygieneSummary report={data} />
      {data.findings.length === 0 ? (
        <NoResult
          title={translate('Nothing to clean up')}
          message={translate(
            'All {count} roles carry a machine-readable code, sit on the scope their name claims, and are bound to the organization that owns them.',
            { count: data.roles_checked },
          )}
          noAction
        />
      ) : (
        <RoleHygieneTable
          findings={data.findings}
          severity={severity}
          onSelectSeverity={setSeverity}
          version={dataUpdatedAt}
        />
      )}
    </>
  );
};
