import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { FormSidebar } from '@waldur/form/FormSidebar';
import { FormSteps } from '@waldur/form/FormSteps';
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
        <div className="d-flex flex-column flex-xl-row gap-5 gap-lg-7 pb-10">
          <ProposalTeam proposal={proposal} />
          <FormSidebar>
            <FormSteps
              steps={[
                {
                  label: translate('Proposed project team'),
                  id: 'step-team',
                },
              ]}
            />
          </FormSidebar>
        </div>
      ) : (
        <ProposalSubmissionStep proposal={proposal} refetch={refetch} />
      )}
    </>
  );
};
