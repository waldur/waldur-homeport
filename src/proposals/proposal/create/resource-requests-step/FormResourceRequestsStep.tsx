import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { getPublicCall } from '@waldur/proposals/api';
import {
  Proposal,
  ProposalFormStepProps,
  ProposalResource,
} from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { AddResourceButton } from './AddResourceButton';
import { ProposalResourcesFilter } from './ProposalResourcesFilter';
import { ResourceRequestItemActions } from './ResourceRequestItemActions';

const mapPropsToFilter = createSelector(
  getFormValues('ProposalResourcesFilter'),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.offering) {
      result.offering_uuid = filters.offering.offering_uuid;
    }
    return result;
  },
);
export const FormResourceRequestsStep = (props: ProposalFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  const {
    data: call,
    isLoading,
    error,
    refetch: refetchCall,
  } = useQuery(
    ['publicCall', proposal.call_uuid],
    () => getPublicCall(proposal.call_uuid),
    {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  );

  const filterValues = useSelector(mapPropsToFilter);

  const filter = useMemo(
    () => ({
      proposal_uuid: proposal.uuid,
      ...filterValues,
    }),
    [proposal, filterValues],
  );

  const tableProps = useTable({
    table: 'ProposalResourcesList',
    fetchData: createFetcher('proposal-requested-resources'),
    filter,
  });

  return (
    <StepCard
      title={props.title}
      step={props.step}
      id={props.id}
      completed={props.observed}
      actions={
        <div className="d-flex justify-content-end flex-grow-1">
          <AddResourceButton
            proposal={props.params.proposal}
            refetch={props.params.refetch}
          />
        </div>
      }
    >
      <Table<ProposalResource>
        {...tableProps}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => <>{row.requested_offering.offering_name}</>,
          },
          {
            title: translate('Provider'),
            render: ({ row }) => <>{row.requested_offering.provider_name}</>,
          },
          {
            title: translate('Category'),
            render: ({ row }) => (
              <>{renderFieldOrDash(row.requested_offering.category_name)}</>
            ),
          },
        ]}
        title={translate('Offering requests')}
        verboseName={translate('Offering requests')}
        filters={
          isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <LoadingErred loadData={refetchCall} />
          ) : (
            <ProposalResourcesFilter offerings={call?.offerings} />
          )
        }
        hasActionBar={false}
        fullWidth
        hoverableRow={({ row, fetch }) => (
          <ResourceRequestItemActions
            row={row}
            proposal={proposal}
            refetch={fetch}
          />
        )}
      />
    </StepCard>
  );
};
