import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getResourceDetails } from '@waldur/marketplace/common/api';
import { PlanDetailsLink } from '@waldur/marketplace/details/plan/PlanDetailsLink';
import { Field } from '@waldur/resource/summary';
import { ResourceComponentsSummary } from '@waldur/resource/summary/ResourceComponentsSummary';
import { ResourceSummary as ResourceSummaryResources } from '@waldur/resource/summary/ResourceSummary';
import {
  BASIC_OFFERING_TYPE,
  SUPPORT_OFFERING_TYPE,
} from '@waldur/support/constants';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { KeyValueButton } from '../KeyValueButton';
import { Resource } from '../types';

const StaticResourceSummary: FunctionComponent<{ row }> = ({ row }) => (
  <ExpandableContainer hasMultiSelect asTable>
    <Field
      label={translate('Plan details')}
      value={row.plan_uuid && <PlanDetailsLink resource={row.uuid} />}
    />
    <Field
      label={translate('Attributes')}
      value={
        row.attributes &&
        Object.keys(row.attributes).length > 0 && (
          <KeyValueButton
            items={row.attributes}
            title={translate('Attributes')}
          />
        )
      }
    />
  </ExpandableContainer>
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
        parent_uuid: row.parent_uuid,
        parent_name: row.parent_name,
      }}
      hasMultiSelect
    />
  );
};

export const ExpandableResourceSummary: FunctionComponent<{
  row: Resource;
}> = ({ row }) => (
  <>
    {(row.is_limit_based || row.is_usage_based) &&
      !(row.resource_type || '').startsWith('OpenStack') && (
        <ExpandableContainer hasMultiSelect>
          <ResourceComponentsSummary resource={row} />
        </ExpandableContainer>
      )}
    {!row.scope ||
    [SUPPORT_OFFERING_TYPE, BASIC_OFFERING_TYPE].includes(row.offering_type) ? (
      <StaticResourceSummary row={row} />
    ) : (
      <DynamicResourceSummary row={row} />
    )}
  </>
);
