import {
  MagnifyingGlassIcon,
  PauseIcon,
  PlusCircleIcon,
  PlayIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import {
  FeatureRule,
  featureRulesDestroy,
  featureRulesList,
  featureRulesMatchedUsersRetrieve,
  featureRulesPartialUpdate,
} from 'waldur-js-client';

import { Badge, BaseButton } from 'waldur-ui';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { FEATURE_RULES_QUERY_KEY, summarizeRule } from './utils';

const FeatureRuleFormDialog = lazyComponent(() =>
  import('./FeatureRuleFormDialog').then((module) => ({
    default: module.FeatureRuleFormDialog,
  })),
);

const FeatureRuleTestMatchDialog = lazyComponent(() =>
  import('./FeatureRuleTestMatchDialog').then((module) => ({
    default: module.FeatureRuleTestMatchDialog,
  })),
);

/** What ActionsDropdown passes each action: the row, refetch and `data`. */
interface RuleRowProps {
  row: FeatureRule;
  refetch: () => void;
  featureLabel: string;
  /** Reopens this list: the app has one dialog slot, which a rule's form or
   * test takes over. */
  back: () => void;
}

const EditRuleAction: FC<RuleRowProps> = ({
  row,
  refetch,
  featureLabel,
  back,
}) => (
  <EditModalButton
    dialog={FeatureRuleFormDialog}
    row={row}
    buildResolve={(rule) => ({
      rule,
      refetch,
      featureKey: rule.feature_key,
      featureLabel,
      back,
    })}
  />
);

const TestRuleAction: FC<RuleRowProps> = ({ row, featureLabel, back }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Test for a user')}
      iconNode={<MagnifyingGlassIcon weight="bold" />}
      action={() =>
        openDialog(FeatureRuleTestMatchDialog, {
          resolve: { rule: row, featureLabel, back },
          size: 'lg',
        })
      }
    />
  );
};

const ToggleRuleAction: FC<RuleRowProps> = ({ row, refetch }) => {
  const active = row.is_active !== false;
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      featureRulesPartialUpdate({
        path: { uuid: row.uuid },
        body: { is_active: !active },
      }),
    refetch,
    invalidateQueries: [{ queryKey: FEATURE_RULES_QUERY_KEY }],
    // The list stays open: this runs from its own row menu.
    closeModal: false,
    successMessage: active
      ? translate('Rule has been deactivated.')
      : translate('Rule has been activated.'),
    errorMessage: translate('Unable to update the rule.'),
  });
  return (
    <ActionItem
      title={active ? translate('Deactivate') : translate('Activate')}
      iconNode={
        active ? <PauseIcon weight="bold" /> : <PlayIcon weight="bold" />
      }
      action={mutate}
      disabled={isPending}
    />
  );
};

const DeleteRuleAction: FC<RuleRowProps> = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => featureRulesDestroy({ path: { uuid: row.uuid } }),
    refetch,
    invalidateQueries: [{ queryKey: FEATURE_RULES_QUERY_KEY }],
    closeModal: false,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the rule {name}?',
        { name: <strong>{row.description || row.uuid}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
    successMessage: translate('Rule has been deleted.'),
    errorMessage: translate('Unable to delete the rule.'),
  });
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};

const STAFF_ACTIONS = [
  EditRuleAction,
  TestRuleAction,
  ToggleRuleAction,
  DeleteRuleAction,
];
// Support may read and test rules, not change them.
const SUPPORT_ACTIONS = [TestRuleAction];

/** Who the rule matches today: a count and the first few users. */
const MatchedUsers: FC<{ row: FeatureRule }> = ({ row }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [...FEATURE_RULES_QUERY_KEY, row.uuid, 'matched-users'],
    queryFn: async () =>
      (await featureRulesMatchedUsersRetrieve({ path: { uuid: row.uuid } }))
        .data,
  });
  if (isLoading) return <LoadingSpinner />;
  if (error || !data) {
    return (
      <p className="text-danger mb-0">
        {translate('Unable to count the users this rule matches.')}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <div className="flex items-center gap-1.5">
        <UsersThreeIcon weight="bold" />
        {data.complete
          ? translate('Matches {count} active users', { count: data.count })
          : translate(
              'Matches at least {count} of the first {checked} active users checked',
              { count: data.count, checked: data.checked },
            )}
      </div>
      {data.users.length ? (
        <ul className="mb-0 ps-5">
          {data.users.map((user) => (
            <li key={user.uuid}>
              {user.full_name || user.username}
              {user.email ? (
                <span className="text-quaternary"> · {user.email}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

interface FeatureRulesDialogProps {
  resolve: {
    featureKey: string;
    featureLabel: string;
    canEdit: boolean;
  };
}

/**
 * The rules that turn one feature, or one micro-app, on for selected users:
 * listed, tested and, for staff, edited here.
 */
export const FeatureRulesDialog: FC<FeatureRulesDialogProps> = ({
  resolve: { featureKey, featureLabel, canEdit },
}) => {
  const filter = useMemo(() => ({ feature_key: featureKey }), [featureKey]);
  const tableProps = useTable({
    table: `feature-rules-${featureKey}`,
    fetchData: createFetcher(featureRulesList),
    filter,
  });
  const { openDialog } = useModal();
  const back = useCallback(
    () =>
      openDialog(FeatureRulesDialog, {
        resolve: { featureKey, featureLabel, canEdit },
        size: 'xl',
      }),
    [openDialog, featureKey, featureLabel, canEdit],
  );
  const actionData = useMemo(
    () => ({ featureLabel, back }),
    [featureLabel, back],
  );

  return (
    <ModalDialog
      title={translate('Who gets {feature}', { feature: featureLabel })}
      subtitle={translate(
        'Users matched by any active rule get it, in addition to everyone it is switched on for',
      )}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <Table<FeatureRule>
        {...tableProps}
        columns={[
          {
            title: translate('Description'),
            render: ({ row }) => renderFieldOrDash(row.description),
          },
          {
            title: translate('Criteria'),
            render: ({ row }) => (
              <div className="flex flex-col gap-0.5 text-sm">
                {summarizeRule(row).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            ),
          },
          {
            title: translate('State'),
            render: ({ row }) =>
              row.is_active !== false ? (
                <Badge variant="success" tone="outline">
                  {translate('Active')}
                </Badge>
              ) : (
                <Badge variant="neutral" tone="outline">
                  {translate('Inactive')}
                </Badge>
              ),
          },
        ]}
        title={translate('Rules')}
        headerClassName="min-h-[40px] py-0"
        titleClassName="h4 font-medium text-secondary"
        hideRefresh
        verboseName={translate('rules')}
        minHeight="auto"
        // The card draws the one border; a table in a dialog adds its own.
        className="[&_[data-slot=table-responsive]]:border-0"
        tableActions={
          canEdit ? (
            <BaseButton
              variant="primary"
              size="sm"
              iconNode={<PlusCircleIcon weight="bold" />}
              label={translate('Add rule')}
              onClick={() =>
                openDialog(FeatureRuleFormDialog, {
                  resolve: {
                    featureKey,
                    featureLabel,
                    refetch: tableProps.fetch,
                    back,
                  },
                  size: 'lg',
                })
              }
            />
          ) : null
        }
        expandableRow={MatchedUsers}
        rowActions={({ row }) => (
          <ActionsDropdown
            row={row}
            refetch={tableProps.fetch}
            data={actionData}
            actions={canEdit ? STAFF_ACTIONS : SUPPORT_ACTIONS}
          />
        )}
      />
    </ModalDialog>
  );
};
