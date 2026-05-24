import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { marketplaceResourcesDetailsRetrieve } from 'waldur-js-client';
import { Resource } from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { PlanDetailsLink } from '@/marketplace/details/plan/PlanDetailsLink';
import { Field } from '@/resource/summary';
import { ResourceComponentsSummary } from '@/resource/summary/ResourceComponentsSummary';
import { ResourceSummary as ResourceSummaryResources } from '@/resource/summary/ResourceSummary';
import {
  BASIC_OFFERING_TYPE,
  SUPPORT_OFFERING_TYPE,
} from '@/support/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { KeyValueButton } from '../KeyValueButton';

const StaticResourceSummary: FunctionComponent<{ row }> = ({ row }) => {
  // Use effective_id if available, otherwise backend_id
  const backendId = row.effective_id || row.backend_id;

  // Use custom label if provided, otherwise default to "Backend ID"
  const backendIdLabel =
    row.offering_plugin_options?.backend_id_display_label ||
    translate('Backend ID');

  return (
    <ExpandableContainer hasMultiSelect asTable>
      {backendId &&
        row.offering_plugin_options?.highlight_backend_id_display && (
          <Field
            label={backendIdLabel}
            value={
              <span className="d-flex align-items-center gap-2">
                <span>{backendId}</span>
                <CopyToClipboardButton value={backendId} onlyButton />
              </span>
            }
          />
        )}

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

      <Field
        label={translate('Options')}
        value={
          row.options &&
          Object.keys(row.options).length > 0 && (
            <KeyValueButton items={row.options} title={translate('Options')} />
          )
        }
      />
    </ExpandableContainer>
  );
};

const DynamicResourceSummary: FunctionComponent<{ row }> = ({ row }) => {
  const {
    data: value,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ['ExpandableResourceSummary', row],

    queryFn: () =>
      marketplaceResourcesDetailsRetrieve({
        path: { uuid: row.uuid },
      }),
  });

  if (error) {
    return <>{translate('Unable to load detail.')}</>;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ResourceSummaryResources
      resource={{
        ...(value?.data as object),
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
  context?: 'provider' | 'customer';
}> = ({ row, context = 'customer' }) => (
  <>
    {(row.is_limit_based || row.is_usage_based) &&
      !(row.resource_type || '').startsWith('OpenStack') && (
        <ExpandableContainer hasMultiSelect>
          <ResourceComponentsSummary resource={row} context={context} />
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
