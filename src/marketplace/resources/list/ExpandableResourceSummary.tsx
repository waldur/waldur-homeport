import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getResourceDetails } from '@waldur/marketplace/common/api';
import { Field } from '@waldur/resource/summary';
import { ResourceDetailsTable } from '@waldur/resource/summary/ResourceDetailsTable';
import { ResourceSummary as ResourceSummaryResources } from '@waldur/resource/summary/ResourceSummary';
import {
  BASIC_OFFERING_TYPE,
  SUPPORT_OFFERING_TYPE,
} from '@waldur/support/constants';

import { KeyValueButton } from '../KeyValueButton';

const StaticResourceSummary: FunctionComponent<{ row }> = ({ row }) => (
  <ResourceDetailsTable>
    <Field label={translate('Plan')} value={row.plan_name || 'N/A'} />
    <Field label={translate('UUID')} value={row.uuid} valueClass="ellipsis" />
    <Field
      label={translate('Attributes')}
      value={
        Object.keys(row.attributes).length > 0 && (
          <KeyValueButton items={row.attributes} />
        )
      }
    />
    <Field label={translate('End date')} value={row.end_date} />
  </ResourceDetailsTable>
);

const DynamicResourceSummary: FunctionComponent<{ row }> = ({ row }) => {
  const { value, error, loading } = useAsync(
    () => getResourceDetails(row.uuid),
    [row],
  );

  if (error) {
    return <>{translate('Unable to load detail.')}</>;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ResourceSummaryResources
      resource={{
        ...value,
        end_date: row.end_date,
      }}
    />
  );
};

export const ExpandableResourceSummary: FunctionComponent<{ row }> = ({
  row,
}) => (
  <>
    {!row.scope ||
    [SUPPORT_OFFERING_TYPE, BASIC_OFFERING_TYPE].includes(row.offering_type) ? (
      <StaticResourceSummary row={row} />
    ) : (
      <DynamicResourceSummary row={row} />
    )}
  </>
);
