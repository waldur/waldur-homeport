import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';

import { useFullPage } from '@waldur/navigation/context';

import { getProposal } from '../api';

import { ProposalDetails } from './ProposalDetails';

export const ProposalDetailsContainer: FC = () => {
  useFullPage();

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

  return (
    <ProposalDetails
      proposal={proposal}
      isLoading={isLoading}
      error={error}
      refetch={refetch}
    />
  );
};
