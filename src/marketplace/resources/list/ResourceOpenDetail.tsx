import { useCallback, FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ResourceSummary as ResourceSummaryResources } from '@waldur/resource/summary/ResourceSummary';

import { ResourceSummary as ResourceSummaryMarketplace } from '../ResourceSummary';

const ResourceOpenDetailResources = ({ row }) => {
  const getScope = useCallback(
    () => get(row.scope).then((response) => response.data),
    [row],
  );

  const { value, error, loading } = useAsync(getScope, [row]);

  if (error) {
    return <>{translate('Unable to load detail.')}</>;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return <ResourceSummaryResources resource={value} />;
};

const ResourceOpenDetailMarketplace = ({ row }) => {
  return <ResourceSummaryMarketplace resource={row} />;
};

export const ResourceOpenDetail: FunctionComponent<{ row }> = ({ row }) => {
  return (
    <>
      {row.scope && <ResourceOpenDetailResources row={row} />}
      {!row.scope && <ResourceOpenDetailMarketplace row={row} />}
    </>
  );
};
