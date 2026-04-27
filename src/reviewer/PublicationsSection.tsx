import { useMemo } from 'react';
import {
  nestedReviewerProfilePublicationsList,
  NestedReviewerProfilePublicationsListData,
  ReviewerPublication,
} from 'waldur-js-client';

import { ExternalLink } from '@/core/ExternalLink';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { PublicationDeleteAction } from './PublicationDeleteAction';
import { PublicationEditAction } from './PublicationEditAction';
import { PublicationsBulkRemoveButton } from './PublicationsBulkRemoveButton';

const PublicationRowActions = ({ row, refetch, profile }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        (props) => <PublicationEditAction {...props} profile={profile} />,
        (props) => <PublicationDeleteAction {...props} profile={profile} />,
      ]}
    />
  );
};

export const PublicationsSection = ({
  profile,
}: {
  profile: any;
  refetch?: () => void;
}) => {
  const filter = useMemo(
    (): NestedReviewerProfilePublicationsListData['query'] => ({}),
    [],
  );

  const tableProps = useTable({
    table: 'reviewerPublicationsList',
    fetchData: createFetcher((...args) =>
      nestedReviewerProfilePublicationsList({
        ...args[0],
        path: { reviewer_profile_uuid: profile.uuid },
      }),
    ),
    filter,
  });

  const columns: Column<ReviewerPublication>[] = [
    {
      title: translate('Title'),
      render: ({ row }) => (
        <div>
          <div className="fw-bold">{row.title}</div>
          {row.doi && (
            <small className="text-muted">
              DOI:{' '}
              <ExternalLink
                url={`https://doi.org/${row.doi}`}
                label={row.doi}
              />
            </small>
          )}
        </div>
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
    {
      title: translate('In matching'),
      render: ({ row }) =>
        row.is_excluded_from_matching
          ? translate('Excluded')
          : translate('Included'),
    },
  ];

  return (
    <Table<ReviewerPublication>
      {...tableProps}
      columns={columns}
      hasActionBar={false}
      cardBordered={false}
      rowActions={({ row }) => (
        <PublicationRowActions
          row={row}
          refetch={tableProps.fetch}
          profile={profile}
        />
      )}
      enableMultiSelect
      multiSelectActions={({ rows, refetch }) => (
        <PublicationsBulkRemoveButton
          rows={rows}
          refetch={refetch}
          profile={profile}
        />
      )}
    />
  );
};
