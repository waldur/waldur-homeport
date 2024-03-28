import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { FormSteps } from '@waldur/form/FormSteps';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { getProposal } from '@waldur/proposals/api';

import { ProgressSteps } from './ProgressSteps';
import { ProposalSubmissionStep } from './ProposalSubmissionStep';
import { ProposalTeam } from './ProposalTeam';

export const ProposalManagePage = () => {
  useFullPage();
  useTitle(translate('Update proposal'));

  const {
    params: { proposal_uuid },
  } = useCurrentStateAndParams();

  const {
    data: proposal,
    isLoading,
    error,
    refetch,
  } = useQuery(['Proposal', proposal_uuid], () => getProposal(proposal_uuid), {
    refetchOnWindowFocus: false,
  });
  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <>
      <ProgressSteps proposal={proposal} bgClass="bg-body" className="mb-10" />
      {proposal.state === 'team_verification' ? (
        <SidebarLayout.Container>
          <SidebarLayout.Body>
            <ProposalTeam proposal={proposal} />
          </SidebarLayout.Body>
          <SidebarLayout.Sidebar>
            <FormSteps
              steps={[
                {
                  label: translate('Proposed project team'),
                  id: 'step-team',
                },
              ]}
            />
          </SidebarLayout.Sidebar>
        </SidebarLayout.Container>
      ) : (
        <ProposalSubmissionStep proposal={proposal} refetch={refetch} />
      )}
    </>
  );
};
