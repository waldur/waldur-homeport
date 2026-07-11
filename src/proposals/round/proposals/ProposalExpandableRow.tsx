import { useQuery } from '@tanstack/react-query';
import React, { FC, useMemo } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import {
  Proposal,
  ProposalReview,
  proposalProposalsChecklistRetrieve,
  proposalReviewsList,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { CHECKLIST_NO_CONFIGURED_MSG } from '@/marketplace-checklist/constants';
import { ParsedAnswer } from '@/project/metadata/ParsedAnswer';
import { RateStars } from '@/proposals/proposal/create-review/RateStars';
import { ReviewStateRenderer } from '@/proposals/review/ReviewStateRenderer';
import { Field } from '@/resource/summary';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { ProposalReviewsRowActions } from './ProposalReviewsRowActions';

interface ProposalExpandableRowProps {
  row: Proposal;
}

/** Add a review name for each review (Review 1, Review 2, ...) */
const dataParser = (data: ProposalReview[], query) => {
  const { page = 1, page_size = 5 } = query;
  return data.map((review, index) => {
    const num = (page - 1) * page_size + index + 1;
    Object.assign(review, {
      name: translate('Review, {index}', { index: num }),
    });
    return review;
  });
};

const renderReviewScoreField = ({ row }) => {
  return <RateStars value={row.summary_score} />;
};

const ComplianceContent: FC<{ data: any }> = ({ data }) => {
  if (!data.questions?.length) {
    return (
      <p className="text-muted">{translate('No compliance questions.')}</p>
    );
  }

  return (
    <FormTable>
      {data.questions.map((question) => (
        <FormTable.Item
          key={question.uuid}
          label={question.description}
          value={
            <ParsedAnswer
              question={question as any}
              answer={question.existing_answer as any}
            />
          }
        />
      ))}
    </FormTable>
  );
};

export const ProposalExpandableRow: React.FC<ProposalExpandableRowProps> = ({
  row,
}) => {
  const filter = useMemo(() => ({ proposal_uuid: row.uuid }), [row]);
  const tableProps = useTable({
    table: 'ProposalReviewsList' + row.uuid,
    fetchData: createFetcher(proposalReviewsList, { parser: dataParser }),
    filter,
  });

  // Fetch compliance checklist data
  const { data: checklistData } = useQuery({
    queryKey: ['ProposalChecklistExpanded', row.uuid],
    queryFn: () =>
      proposalProposalsChecklistRetrieve({
        path: { uuid: row.uuid },
        query: { include_all: true },
      })
        .then((response) => response.data)
        .catch((err) => {
          // Handle "No checklist configured" gracefully
          if (
            err.response?.status === 400 &&
            err.response?.data?.detail === CHECKLIST_NO_CONFIGURED_MSG
          ) {
            return null;
          }
          return null; // Silently fail for other errors in expandable row
        }),
    staleTime: SHORT_STALE_TIME,
  });

  const reviewsCount = tableProps.pagination.resultCount ?? 0;
  const questionsCount = checklistData?.questions?.length ?? 0;

  const columns = [
    {
      title: translate('Review'),
      render: ({ row: review }) => (
        <Link
          state="proposal-review"
          params={{ review_uuid: review.uuid }}
          label={review.name} // Generated in frontend
        />
      ),
    },
    {
      title: translate('Reviewer'),
      render: ({ row }) => row.reviewer_full_name,
    },
    {
      title: translate('Status'),
      render: ReviewStateRenderer,
    },
    {
      title: translate('Score'),
      render: renderReviewScoreField,
    },
  ];

  return (
    <ExpandableContainer>
      {row.project_summary && (
        <Field
          label={translate('Project summary')}
          value={row.project_summary}
          className="col-md-12 mb-5"
        />
      )}

      <Tab.Container defaultActiveKey="reviews" unmountOnExit={true}>
        <Nav variant="tabs" className="nav-line-tabs flex-nowrap mb-4">
          <Nav.Item>
            <Nav.Link eventKey="reviews">
              {translate('Reviews')} ({reviewsCount})
            </Nav.Link>
          </Nav.Item>
          {checklistData && (
            <Nav.Item>
              <Nav.Link eventKey="compliance">
                {translate('Compliance')} ({questionsCount})
              </Nav.Link>
            </Nav.Item>
          )}
        </Nav>

        <Tab.Content className="overflow-auto">
          <Tab.Pane eventKey="reviews">
            <Table
              {...tableProps}
              columns={columns}
              minHeight="auto"
              hideRefresh
              verboseName={translate('Reviews')}
              equalColWidth
              hasActionBar={false}
              rowActions={ProposalReviewsRowActions}
              showPageSizeSelector
              initialPageSize={5}
            />
          </Tab.Pane>

          {checklistData && (
            <Tab.Pane eventKey="compliance">
              <ComplianceContent data={checklistData} />
            </Tab.Pane>
          )}
        </Tab.Content>
      </Tab.Container>
    </ExpandableContainer>
  );
};
