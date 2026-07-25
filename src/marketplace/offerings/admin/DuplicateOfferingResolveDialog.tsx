import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Alert } from 'react-bootstrap';
import {
  DuplicateOfferingGroup,
  DuplicateOfferingMergePlan,
  marketplaceOpenstackDuplicateOfferingsRemediate,
} from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

const columns: Column<DuplicateOfferingMergePlan>[] = [
  {
    title: translate('Offering'),
    render: ({ row }) => (
      <>
        {row.duplicate_name}{' '}
        <span className="text-muted">#{row.duplicate_id}</span>
      </>
    ),
    id: 'duplicate_name',
  },
  {
    title: translate('Action'),
    render: ({ row }) =>
      row.action === 'delete'
        ? translate('Delete (nothing attached)')
        : row.action === 'merge'
          ? translate('Merge into keeper')
          : translate('Skip'),
    id: 'action',
  },
  {
    title: translate('Resources'),
    render: ({ row }) => <>{row.resource_count}</>,
    id: 'resource_count',
  },
  {
    title: translate('Orders'),
    render: ({ row }) => <>{row.order_count}</>,
    id: 'order_count',
  },
  {
    title: translate('Billing periods'),
    render: ({ row }) => <>{row.plan_period_count}</>,
    id: 'plan_period_count',
  },
  {
    title: translate('Usage records'),
    render: ({ row }) => <>{row.component_usage_count}</>,
    id: 'component_usage_count',
  },
];

const PlanTable: FC<{ plans: DuplicateOfferingMergePlan[] }> = ({ plans }) => {
  const tableProps = useTable<DuplicateOfferingMergePlan>({
    table: 'DuplicateOfferingMergePlan',
    fetchData: createClientPaginatedFetcher(plans),
  });
  return (
    <Table<DuplicateOfferingMergePlan>
      {...tableProps}
      columns={columns}
      verboseName={translate('duplicates')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

export const DuplicateOfferingResolveDialog = ({ resolve }) => {
  const group: DuplicateOfferingGroup = resolve.group;
  const body = {
    tenant_id: group.tenant_id,
    offering_type: group.offering_type,
  };

  // Preview first: the same call with dry_run, so staff see exactly what the
  // apply step will do before committing to it.
  const {
    data: preview,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'DuplicateOfferingPreview',
      group.tenant_id,
      group.offering_type,
    ],
    queryFn: () =>
      marketplaceOpenstackDuplicateOfferingsRemediate({
        body: { ...body, dry_run: true },
      }).then((response) => response.data),
  });

  const applyMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOpenstackDuplicateOfferingsRemediate({
        body: { ...body, dry_run: false },
      }),
    successMessage: translate('The duplicate offerings have been resolved.'),
    errorMessage: translate('Unable to resolve the duplicate offerings.'),
    refetch: resolve.refetch,
  });

  const blockers = preview?.blockers ?? [];
  const canApply = Boolean(preview) && blockers.length === 0;

  return (
    <ModalDialog
      title={translate('Resolve duplicate offerings')}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            type="button"
            disabled={!canApply || applyMutation.isPending}
            submitting={applyMutation.isPending}
            onClick={() => applyMutation.mutate()}
            label={translate('Resolve')}
            disabledReason={
              blockers.length
                ? translate('Resolve the blockers listed above first.')
                : undefined
            }
          />
        </>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to preview the changes.')}
          loadData={refetch}
        />
      ) : preview ? (
        <>
          <p>
            {translate(
              'Everything below will be moved onto {keeper}, and the duplicate offerings deleted.',
              { keeper: <strong>{preview.keeper_name}</strong> },
              formatJsxTemplate,
            )}
          </p>

          <PlanTable plans={preview.duplicates} />

          {blockers.length > 0 && (
            <Alert variant="danger" className="mt-5 mb-0">
              <h5>{translate('Cannot resolve automatically')}</h5>
              <p>
                {translate(
                  'The keeper is missing a counterpart for the records below, so merging would discard billing or usage history.',
                )}
              </p>
              <ul className="mb-0">
                {blockers.map((blocker, index) => (
                  <li key={index}>{blocker}</li>
                ))}
              </ul>
            </Alert>
          )}
        </>
      ) : null}
    </ModalDialog>
  );
};
