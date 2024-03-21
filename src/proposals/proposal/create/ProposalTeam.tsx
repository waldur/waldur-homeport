import { ProposalHeader } from './ProposalHeader';
import { ProposalSummaryCard } from './ProposalSummaryCard';

export const ProposalTeam = ({ proposal }) => {
  return (
    <div className="d-flex flex-column flex-xl-row gap-5 gap-lg-7 pb-10">
      <div className="container-xxl pe-xl-0 d-flex flex-column flex-lg-row-fluid gap-5 gap-lg-7">
        <ProposalHeader proposal={proposal} />
        <ProposalSummaryCard proposal={proposal} />
      </div>
    </div>
  );
};
