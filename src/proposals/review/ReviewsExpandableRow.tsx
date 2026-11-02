import { useQuery } from '@tanstack/react-query';
import {
  proposalProposalsResourcesList,
  proposalProposalsRetrieve,
  ProposalReview,
} from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <div>
          <PropertyList variant="summary">
            <PropertyItem
              label={translate('Applicant name')}
              value={data.proposal.created_by_name}
            />

            <PropertyItem
              label={translate('Submission date')}
              value={propVal.date(data.proposal.created, {
                precision: 'datetime',
              })}
            />

            {data.proposal.project && (
              <PropertyItem
                label={translate('Project')}
                value={data.proposal.project_name}
              />
            )}
            <PropertyItem
              label={translate('Offering')}
              value={propVal.list(data.offeringNames)}
            />
          </PropertyList>
        </div>
        <div>
          <PropertyList variant="summary">
            <PropertyItem
              label={translate('Project summary')}
              value={data.proposal.project_summary}
            />
          </PropertyList>
        </div>
      </div>
    </ExpandableContainer>
  );
};
