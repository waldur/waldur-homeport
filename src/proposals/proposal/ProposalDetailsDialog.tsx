import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { FieldWithCopy } from '@waldur/core/FieldWithCopy';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Proposal } from '@waldur/proposals/types';

import { EndingField } from '../EndingField';

interface ProposalDetailsDialogProps {
  proposal: Proposal;
}

export const ProposalDetailsDialog: FC<ProposalDetailsDialogProps> = ({
  proposal,
}) => {
  const {
    data: call,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['publicCall', proposal.call_uuid],

    queryFn: () =>
      proposalPublicCallsRetrieve({ path: { uuid: proposal.call_uuid } }).then(
        (r) => r.data,
      ),

    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  return (
    <ModalDialog title={translate('Proposal details overview')} closeButton>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        <Tabs
          defaultActiveKey={1}
          unmountOnExit={true}
          className="nav-line-tabs"
        >
          {call ? (
            <Tab eventKey={1} title={translate('Call')}>
              <FormTable hideActions alignTop className="gy-5">
                <FormTable.Item
                  label={translate('Name')}
                  value={<FieldWithCopy value={call.name} />}
                />

                <FormTable.Item
                  label={translate('Reference code')}
                  value={<FieldWithCopy value={(call as any).reference_code} />}
                />
              </FormTable>
            </Tab>
          ) : null}
          <Tab eventKey={2} title={translate('Round')}>
            <FormTable hideActions alignTop className="gy-5">
              <FormTable.Item
                label={translate('Cutoff date')}
                value={
                  <FieldWithCopy
                    value={
                      <EndingField
                        endDate={proposal.round.cutoff_time}
                        dateFirst
                      />
                    }
                  />
                }
              />
            </FormTable>
          </Tab>
        </Tabs>
      )}
    </ModalDialog>
  );
};
