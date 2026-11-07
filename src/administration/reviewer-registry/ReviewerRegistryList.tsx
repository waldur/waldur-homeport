import { CheckIcon, ShieldWarningIcon, XIcon } from '@phosphor-icons/react';
import { FC, useMemo, useState } from 'react';
import {
  ReviewerRegistry,
  reviewerRegistryApprovePublication,
  reviewerRegistryList,
  reviewerRegistryRejectPublication,
} from 'waldur-js-client';

import { Badge, Tabs } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ReviewerStandingBadge } from '@/reviewer/ReviewerStandingBadge';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const SetStandingDialog = lazyComponent(() =>
  import('./SetStandingDialog').then((module) => ({
    default: module.SetStandingDialog,
  })),
);

const isPending = (row: ReviewerRegistry) =>
  row.publication_request?.state === 'pending';

const PublicationDecisionAction: FC<{
  row: ReviewerRegistry;
  approve: boolean;
  refetch(): void;
}> = ({ row, approve, refetch }) => {
  const { mutate, isPending: busy } = useManagedMutation<any, any, any>({
    mutationFn: (result) =>
      (approve
        ? reviewerRegistryApprovePublication
        : reviewerRegistryRejectPublication)({
        path: { uuid: row.uuid },
        // An empty comment is refused: leave it out instead.
        body: result?.input ? { comment: result.input } : {},
      }),
    confirmation: {
      title: approve
        ? translate('Approve publication')
        : translate('Reject publication'),
      body: approve
        ? translate("{name}'s profile becomes discoverable by call managers.", {
            name: row.user_full_name,
          })
        : translate(
            "{name}'s profile stays unpublished. The reviewer reads your comment.",
            { name: row.user_full_name },
          ),
      options: {
        showInput: true,
        inputLabel: translate('Comment'),
        inputRequired: !approve,
        positiveButton: approve ? translate('Approve') : translate('Reject'),
        positiveButtonVariant: approve ? 'primary' : 'danger',
      },
    },
    refetch,
    successMessage: approve
      ? translate('Publication approved.')
      : translate('Publication rejected.'),
    errorMessage: translate('Unable to decide the publication request.'),
  });
  return (
    <ActionItem
      title={
        approve
          ? translate('Approve publication')
          : translate('Reject publication')
      }
      action={mutate}
      disabled={busy}
      iconNode={approve ? <CheckIcon weight="bold" /> : <XIcon weight="bold" />}
    />
  );
};

const RowActions: FC<{ row: ReviewerRegistry; fetch(): void }> = ({
  row,
  fetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionsDropdown row={row} refetch={fetch}>
      <ActionItem
        title={translate('Set standing')}
        action={() =>
          openDialog(SetStandingDialog, {
            resolve: { reviewer: row, refetch: fetch },
          })
        }
        iconNode={<ShieldWarningIcon weight="bold" />}
      />
      {isPending(row) && (
        <>
          <PublicationDecisionAction row={row} approve refetch={fetch} />
          <PublicationDecisionAction
            row={row}
            approve={false}
            refetch={fetch}
          />
        </>
      )}
    </ActionsDropdown>
  );
};

const PublicationCell: FC<{ row: ReviewerRegistry }> = ({ row }) =>
  row.is_published ? (
    <Badge variant="success" shape="pill" tone="outline">
      {translate('Published')}
    </Badge>
  ) : isPending(row) ? (
    <Badge variant="warning" shape="pill" tone="outline">
      {translate('Awaiting approval')}
    </Badge>
  ) : (
    <span className="text-quaternary">{translate('Not published')}</span>
  );

type View = 'all' | 'pending' | 'restricted';

/**
 * The platform operator's reviewer registry: every reviewer with their
 * standing, publication state, the calls they review for and the work they
 * hold. Staff set standings and decide publication requests here.
 */
export const ReviewerRegistryList: FC = () => {
  const [view, setView] = useState<View>('all');
  const filter = useMemo(
    () =>
      view === 'pending'
        ? { publication_pending: true }
        : view === 'restricted'
          ? { standing: ['suspended', 'blocked'] }
          : {},
    [view],
  );
  const tableProps = useTable({
    table: 'ReviewerRegistry',
    fetchData: createFetcher(reviewerRegistryList),
    queryField: 'query',
    filter,
  });
  return (
    <Table<ReviewerRegistry>
      {...tableProps}
      title={translate('Reviewer registry')}
      verboseName={translate('reviewers')}
      hasQuery
      tableActions={
        <Tabs
          value={view}
          onValueChange={(value) => setView(value as View)}
          items={[
            { value: 'all', title: translate('All') },
            { value: 'pending', title: translate('Awaiting approval') },
            { value: 'restricted', title: translate('Suspended or blocked') },
          ]}
        />
      }
      columns={[
        {
          title: translate('Reviewer'),
          render: ({ row }) => (
            <div className="flex flex-col">
              <span>{row.user_full_name || row.user_username}</span>
              <span className="text-quaternary small">{row.user_email}</span>
            </div>
          ),
        },
        {
          title: translate('Standing'),
          render: ({ row }) => (
            <div className="flex flex-col items-start gap-1">
              <ReviewerStandingBadge standing={row.standing} showActive />
              {row.standing !== 'active' && row.standing_reason && (
                <span className="text-quaternary small">
                  {row.standing_reason}
                </span>
              )}
              {!row.user_is_active && (
                <span className="text-quaternary small">
                  {translate('Account deactivated')}
                </span>
              )}
            </div>
          ),
        },
        {
          title: translate('Profile'),
          render: PublicationCell,
        },
        {
          title: translate('Reviewer pools'),
          render: ({ row }) =>
            row.pools.length ? (
              <>{row.pools.map((pool) => pool.call_name).join(', ')}</>
            ) : (
              <>{renderFieldOrDash(null)}</>
            ),
        },
        {
          title: translate('Open work'),
          render: ({ row }) => (
            <>{row.open_assignments + row.reviews_in_progress}</>
          ),
        },
        {
          title: translate('Standing changed'),
          render: ({ row }) =>
            row.standing_changed_at ? (
              <div className="flex flex-col">
                <span>{formatDate(row.standing_changed_at)}</span>
                <span className="text-quaternary small">
                  {row.standing_changed_by_name}
                </span>
              </div>
            ) : (
              <>{renderFieldOrDash(null)}</>
            ),
        },
      ]}
      rowActions={RowActions}
    />
  );
};
