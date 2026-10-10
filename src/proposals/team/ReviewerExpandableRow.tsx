import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo } from 'react';
import {
  ReviewerAffiliation,
  ReviewerExpertise,
  reviewerProfilesList,
  ReviewerPublication,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { ExternalLink } from '@/core/ExternalLink';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { OrcidLogo } from '@/core/OrcidLogo';
import { translate } from '@/i18n';
import { GenericPermission } from '@/permissions/types';
import { Field } from '@/resource/summary';
import { createClientPaginatedFetcher } from '@/table/api';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

interface ReviewerExpandableRowProps {
  row: GenericPermission;
}

const AffiliationsTable: FC<{ affiliations: ReviewerAffiliation[] }> = ({
  affiliations,
}) => {
  const fetchData = useMemo(
    () => createClientPaginatedFetcher(affiliations),
    [affiliations],
  );

  const tableProps = useTable({
    table: 'reviewerAffiliationsExpanded',
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
      showPageSizeSelector
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
    table: 'reviewerExpertiseExpanded',
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
      showPageSizeSelector
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
    table: 'reviewerPublicationsExpanded',
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
      showPageSizeSelector
    />
  );
};

export const ReviewerExpandableRow: FC<ReviewerExpandableRowProps> = ({
  row,
}) => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['reviewerProfile', row.user_uuid],
    queryFn: () =>
      reviewerProfilesList({ query: { user_uuid: row.user_uuid } }).then(
        (response) => response.data?.[0],
      ),
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

  if (isLoading) {
    return (
      <ExpandableContainer>
        <LoadingSpinner />
      </ExpandableContainer>
    );
  }

  if (!profile) {
    return (
      <ExpandableContainer>
        <p className="text-muted">{translate('No reviewer profile found.')}</p>
      </ExpandableContainer>
    );
  }

  return (
    <ExpandableContainer hasMultiSelect>
      <EmbeddedTabs
        defaultValue="profile"
        listClassName="mb-4"
        tabs={[
          {
            key: 'profile',
            title: translate('Profile'),
            content: (
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
            ),
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
