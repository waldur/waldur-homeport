import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'react-bootstrap';
import {
  proposalProposalsResourcesList,
  proposalProposalsRetrieve,
  ProposalReview,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

const loadProposalData = async (proposal_uuid: string) => {
  const proposal = await proposalProposalsRetrieve({
    path: { uuid: proposal_uuid },
  }).then((response) => response.data);

  const resources = await proposalProposalsResourcesList({
    path: { uuid: proposal_uuid },
  }).then((response) => response.data);

  const offeringNames = resources.map(
    (resource) => resource.requested_offering.offering_name,
  );

  return { proposal, offeringNames };
};

export const ReviewsExpandableRow = ({ row }: { row: ProposalReview }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['proposal', row.proposal],
    queryFn: () => loadProposalData(row.proposal_uuid),
    refetchOnWindowFocus: false,
  });
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return translate('Unable to load data');
  }

  return (
    <ExpandableContainer>
      <Row>
        <Col xs={12} md={6}>
          <Field
            label={translate('Applicant name')}
            value={data.proposal.created_by_name}
          />

          <Field
            label={translate('Submission date')}
            value={formatDateTime(data.proposal.created)}
          />

          {data.proposal.project && (
            <Field
              label={translate('Project')}
              value={data.proposal.project_name}
            />
          )}
          <Field
            label={translate('Offering')}
            value={data.offeringNames.join(', ')}
          />
        </Col>
        <Col xs={12} md={6}>
          <Field
            label={translate('Project summary')}
            value={data.proposal.project_summary}
          />
        </Col>
      </Row>
    </ExpandableContainer>
  );
};
