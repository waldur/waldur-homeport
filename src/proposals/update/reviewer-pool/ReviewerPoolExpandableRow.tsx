import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo } from 'react';
import {
  CallReviewerPool,
  conflictsOfInterestList,
  ConflictOfInterest,
  ReviewerAffiliation,
  ReviewerExpertise,
  reviewerProfilesList,
  ReviewerPublication,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { SHORT_STALE_TIME } from '@/core/constants';
import { ExternalLink } from '@/core/ExternalLink';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { OrcidLogo } from '@/core/OrcidLogo';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { Field } from '@/resource/summary';
import { createClientPaginatedFetcher } from '@/table/api';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

interface ReviewerPoolExpandableRowProps {
  row: CallReviewerPool;
}

const AffiliationsTable: FC<{ affiliations: ReviewerAffiliation[] }> = ({
  affiliations,
}) => {
  const fetchData = useMemo(
    () => createClientPaginatedFetcher(affiliations),
    [affiliations],
  );

  const tableProps = useTable({
    table: 'reviewerPoolAffiliations',
    fetchData,
  });

  useEffect(() => {
    tableProps.fetch();
  }, [affiliations]);

  return (
    <Table<ReviewerAffiliation>
      {...tableProps}
      columns={[
        {
          title: translate('Organization'),
          render: ({ row }) => row.organization_name_display,
        },
        {
          title: translate('Position'),
          render: ({ row }) => renderFieldOrDash(row.position_title),
        },
        {
          title: translate('Department'),
          render: ({ row }) => renderFieldOrDash(row.department),
        },
      ]}
      verboseName={translate('affiliations')}
      hasActionBar={false}
      minHeight="auto"
    />
  );
};

const ExpertiseTable: FC<{ expertise: ReviewerExpertise[] }> = ({
  expertise,
}) => {
  const fetchData = useMemo(
    () => createClientPaginatedFetcher(expertise),
    [expertise],
  );

  const tableProps = useTable({
    table: 'reviewerPoolExpertise',
    fetchData,
  });

  useEffect(() => {
    tableProps.fetch();
  }, [expertise]);

  return (
    <Table<ReviewerExpertise>
      {...tableProps}
      columns={[
        {
          title: translate('Keyword'),
          render: ({ row }) => row.expertise_keyword,
        },
        {
          title: translate('Category'),
          render: ({ row }) => renderFieldOrDash(row.expertise_category_name),
        },
      ]}
      verboseName={translate('expertise keywords')}
      hasActionBar={false}
      minHeight="auto"
    />
  );
};

const PublicationsTable: FC<{ publications: ReviewerPublication[] }> = ({
  publications,
}) => {
  const fetchData = useMemo(
    () => createClientPaginatedFetcher(publications),
    [publications],
  );

  const tableProps = useTable({
    table: 'reviewerPoolPublications',
    fetchData,
  });

  useEffect(() => {
    tableProps.fetch();
  }, [publications]);

  return (
    <Table<ReviewerPublication>
      {...tableProps}
      columns={[
        {
          title: translate('Title'),
          render: ({ row }) =>
            row.doi ? (
              <ExternalLink
                url={`https://doi.org/${row.doi}`}
                label={row.title}
              />
            ) : (
              row.title
            ),
        },
        {
          title: translate('Venue'),
          render: ({ row }) => renderFieldOrDash(row.venue),
        },
        {
          title: translate('Year'),
          render: ({ row }) => row.publication_year,
        },
      ]}
      verboseName={translate('publications')}
      hasActionBar={false}
      minHeight="auto"
    />
  );
};

const SeverityBadge: FC<{ severity: string; display: string }> = ({
  severity,
  display,
}) => {
  const variant = useMemo(() => {
    switch (severity) {
      case 'real':
        return 'danger';
      case 'apparent':
        return 'warning';
      case 'potential':
        return 'info';
      default:
        return 'secondary';
    }
  }, [severity]);

  return (
    <Badge variant={variant} shape="pill" tone="outline">
      {display}
    </Badge>
  );
};

const StatusBadge: FC<{ status: string; display: string }> = ({
  status,
  display,
}) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'confirmed':
        return 'danger';
      case 'dismissed':
        return 'secondary';
      case 'waived':
        return 'warning';
      case 'recused':
        return 'info';
      case 'pending':
      default:
        return 'primary';
    }
  }, [status]);

  return (
    <Badge variant={variant} shape="pill" tone="outline">
      {display}
    </Badge>
  );
};

const COITable: FC<{ conflicts: ConflictOfInterest[] }> = ({ conflicts }) => {
  const fetchData = useMemo(
    () => createClientPaginatedFetcher(conflicts),
    [conflicts],
  );

  const tableProps = useTable({
    table: 'reviewerPoolCOI',
    fetchData,
  });

  useEffect(() => {
    tableProps.fetch();
  }, [conflicts]);

  if (conflicts.length === 0) {
    return (
      <p className="text-muted">{translate('No conflicts of interest.')}</p>
    );
  }

  return (
    <Table<ConflictOfInterest>
      {...tableProps}
      columns={[
        {
          title: translate('Proposal'),
          render: ({ row }) => row.proposal_name,
        },
        {
          title: translate('Type'),
          render: ({ row }) => row.coi_type_display,
        },
        {
          title: translate('Severity'),
          render: ({ row }) => (
            <SeverityBadge
              severity={row.severity}
              display={row.severity_display}
            />
          ),
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <StatusBadge status={row.status} display={row.status_display} />
          ),
        },
      ]}
      verboseName={translate('conflicts')}
      hasActionBar={false}
      minHeight="auto"
    />
  );
};

export const ReviewerPoolExpandableRow: FC<ReviewerPoolExpandableRowProps> = ({
  row,
}) => {
  // Fetch reviewer profile if available
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['reviewerPoolProfile', row.reviewer_uuid],
    queryFn: () =>
      row.reviewer_uuid
        ? reviewerProfilesList({
            query: { user_uuid: row.reviewer_uuid },
          }).then((response) => response.data?.[0])
        : Promise.resolve(null),
    enabled: !!row.reviewer_uuid,
    staleTime: SHORT_STALE_TIME,
  });

  // Fetch COI for this reviewer
  const { data: conflicts = [], isLoading: coiLoading } = useQuery({
    queryKey: ['reviewerPoolCOI', row.call_uuid, row.reviewer_uuid],
    queryFn: () =>
      row.reviewer_uuid
        ? conflictsOfInterestList({
            query: {
              call_uuid: row.call_uuid,
              reviewer_uuid: row.reviewer_uuid,
            },
          }).then((response) => response.data || [])
        : Promise.resolve([]),
    enabled: !!row.reviewer_uuid,
    staleTime: SHORT_STALE_TIME,
  });

  const affiliationsCount = useMemo(
    () => profile?.affiliations?.length ?? 0,
    [profile],
  );
  const expertiseCount = useMemo(
    () => profile?.expertise_set?.length ?? 0,
    [profile],
  );
  const publicationsCount = useMemo(
    () => profile?.publications?.length ?? 0,
    [profile],
  );
  const coiCount = conflicts.length;

  if (!row.reviewer_uuid) {
    return (
      <ExpandableContainer>
        <NoResult
          title={translate('No profile data')}
          message={translate(
            'This reviewer has not yet accepted the invitation or created a profile.',
          )}
          noAction
        />
      </ExpandableContainer>
    );
  }

  if (profileLoading || coiLoading) {
    return (
      <ExpandableContainer>
        <LoadingSpinner />
      </ExpandableContainer>
    );
  }

  return (
    <ExpandableContainer>
      <EmbeddedTabs
        defaultValue="profile"
        listClassName="mb-4"
        tabs={[
          {
            key: 'profile',
            title: translate('Profile'),
            content: (
              <>
                {profile ? (
                  <>
                    <Field
                      label={translate('ORCID iD')}
                      value={
                        profile.orcid_id ? (
                          <a
                            href={`https://orcid.org/${profile.orcid_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-inline-flex align-items-center gap-1"
                          >
                            <OrcidLogo size={16} />
                            https://orcid.org/{profile.orcid_id}
                          </a>
                        ) : (
                          <span className="text-muted">
                            {translate('Not connected')}
                          </span>
                        )
                      }
                    />
                    <Field
                      label={translate('Reviews completed')}
                      value={profile.stats?.total_reviews_completed ?? 0}
                    />
                    <Field
                      label={translate('Biography')}
                      value={
                        profile.biography || (
                          <span className="text-muted">
                            {translate('Not provided')}
                          </span>
                        )
                      }
                    />
                  </>
                ) : (
                  <p className="text-muted">
                    {translate('No reviewer profile found.')}
                  </p>
                )}
              </>
            ),
          },
          {
            key: 'coi',
            title: translate('COI'),
            count: coiCount,
            content: <COITable conflicts={conflicts} />,
          },
          {
            key: 'affiliations',
            title: translate('Affiliations'),
            count: affiliationsCount,
            content: (
              <>
                {affiliationsCount === 0 ? (
                  <p className="text-muted">
                    {translate('No affiliations added.')}
                  </p>
                ) : (
                  <AffiliationsTable affiliations={profile.affiliations} />
                )}
              </>
            ),
          },
          {
            key: 'expertise',
            title: translate('Expertise'),
            count: expertiseCount,
            content: (
              <>
                {expertiseCount === 0 ? (
                  <p className="text-muted">
                    {translate('No expertise keywords added.')}
                  </p>
                ) : (
                  <ExpertiseTable expertise={profile.expertise_set} />
                )}
              </>
            ),
          },
          {
            key: 'publications',
            title: translate('Publications'),
            count: publicationsCount,
            content: (
              <>
                {publicationsCount === 0 ? (
                  <p className="text-muted">
                    {translate('No publications added.')}
                  </p>
                ) : (
                  <PublicationsTable publications={profile.publications} />
                )}
              </>
            ),
          },
        ]}
      />
    </ExpandableContainer>
  );
};
