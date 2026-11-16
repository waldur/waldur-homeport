import { StepComponentProps } from 'waldur-wizard';

import { ComplianceSummary } from '@/proposals/proposal/create/ComplianceSummary';
import { Proposal } from '@/proposals/types';

/** Read-only view of the applicant's compliance answers for the reviewer.
 *  Renders nothing when the checklist is not configured or the backend
 *  denies the viewer access to it. */
export const ReviewComplianceStep = (props: StepComponentProps) => {
  const proposal: Proposal = props.params?.proposal;
  return <ComplianceSummary proposal={proposal} id={props.id} />;
};
