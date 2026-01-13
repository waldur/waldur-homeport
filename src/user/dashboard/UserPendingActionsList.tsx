import {
  BellSlashIcon,
  BellIcon,
  CheckCircleIcon,
  ArrowsClockwiseIcon,
  EyeIcon,
  XCircleIcon,
  CalendarPlusIcon,
  ArchiveIcon,
  TrashIcon,
  GearIcon,
  WrenchIcon,
  EnvelopeIcon,
  ChartBarIcon,
} from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  User,
  UserAction,
  userActionsList,
  userActionsUpdateActions,
  userActionsSilence,
  userActionsUnsilence,
  userActionsExecuteAction,
} from 'waldur-js-client';

import { AlertItem } from '@waldur/core/AlertItem';
import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { useTable } from '@waldur/table/useTable';

const USER_PENDING_ACTIONS_FILTER_FORM_ID = 'UserPendingActionsFilter';

interface OwnProps {
  user: User;
}

interface PendingActionsFilter {
  include_silenced?: boolean;
}

interface CorrectiveAction {
  label: string;
  category: string;
  severity: string;
  method?: string;
  api_endpoint?: boolean;
  confirmation_required?: boolean;
  permissions_required?: string[];
  metadata?: Record<string, any>;
  route_name?: string;
  route_params?: Record<string, any>;
}

// Extended UserAction interface with new typed fields
interface ExtendedUserAction extends Omit<UserAction, 'route_params'> {
  route_name?: string;
  route_params?: Record<string, any>;
  project_name?: string;
  project_uuid?: string;
  organization_name?: string;
  organization_uuid?: string;
  offering_name?: string;
  offering_type?: string;
}

const ACTION_CATEGORY_CONFIG = {
  view: { icon: EyeIcon, variant: 'text-primary' },
  approve: { icon: CheckCircleIcon, variant: 'success' },
  reject: { icon: XCircleIcon, variant: 'danger' },
  extend: { icon: CalendarPlusIcon, variant: 'warning' },
  backup: { icon: ArchiveIcon, variant: 'text-secondary' },
  terminate: { icon: TrashIcon, variant: 'danger' },
  configure: { icon: GearIcon, variant: 'text-secondary' },
  repair: { icon: WrenchIcon, variant: 'warning' },
  contact: { icon: EnvelopeIcon, variant: 'text-secondary' },
  monitor: { icon: ChartBarIcon, variant: 'text-secondary' },
  silence: { icon: BellSlashIcon, variant: 'text-secondary' }, // For our built-in silence action
} as const;

// Filter component for pending actions
const PendingActionsFilter: FC = () => (
  <TableFilterItem
    title={translate('Show silenced actions')}
    name="include_silenced"
    badgeValue={(value) => (value ? translate('Including silenced') : null)}
  >
    <Field
      name="include_silenced"
      component={AwesomeCheckboxField}
      label={translate('Include silenced actions')}
    />
  </TableFilterItem>
);

// Component for displaying project/organization context
const ActionContext: FC<{ row: UserAction }> = ({ row }) => {
  const extendedRow = row as unknown as ExtendedUserAction;

  return (
    <div className="d-flex align-items-center gap-3 flex-wrap mt-2">
      {extendedRow.organization_name && extendedRow.organization_uuid && (
        <div className="d-flex align-items-center gap-1">
          <span className="text-muted small">{translate('Organization')}:</span>
          <Link
            state="organization.dashboard"
            params={{ uuid: extendedRow.organization_uuid }}
            label={extendedRow.organization_name}
            className="small fw-medium"
          />
        </div>
      )}
      {extendedRow.project_name && extendedRow.project_uuid && (
        <div className="d-flex align-items-center gap-1">
          <span className="text-muted small">{translate('Project')}:</span>
          <Link
            state="project.dashboard"
            params={{ uuid: extendedRow.project_uuid }}
            label={extendedRow.project_name}
            className="small fw-medium"
          />
        </div>
      )}
      {extendedRow.offering_name && (
        <div className="d-flex align-items-center gap-1">
          <span className="text-muted small">{translate('Offering')}:</span>
          <span className="small">{extendedRow.offering_name}</span>
        </div>
      )}
    </div>
  );
};

// Create action handler for corrective actions
const createActionHandler = (
  action: CorrectiveAction,
  row: UserAction,
  refetch?: () => void,
  router?: any,
  dispatch?: any,
) => {
  return async () => {
    try {
      if (action.api_endpoint) {
        // Execute via backend API
        await userActionsExecuteAction({
          path: { uuid: row.uuid as any },
          body: { action_label: action.label },
        });
        dispatch?.(showSuccess(translate('Action executed successfully.')));
        refetch?.();
      } else {
        // Handle navigation using route-based approach only
        if (action.route_name && router) {
          router.stateService.go(action.route_name, action.route_params || {});
        }
      }
    } catch (e) {
      if (e.response?.status === 404) {
        dispatch?.(
          showErrorResponse(
            e,
            translate('Action not found or no longer available.'),
          ),
        );
      } else {
        dispatch?.(
          showErrorResponse(e, translate('Unable to execute action.')),
        );
      }
    }
  };
};

// Create dynamic action component from corrective action
const createDynamicAction = (
  action: CorrectiveAction,
  row: UserAction,
  refetch?: () => void,
  router?: any,
  dispatch?: any,
) => {
  const config =
    ACTION_CATEGORY_CONFIG[
      action.category as keyof typeof ACTION_CATEGORY_CONFIG
    ] || ACTION_CATEGORY_CONFIG.view;
  const IconComponent = config.icon;

  return () => (
    <ActionItem
      title={action.label}
      action={createActionHandler(action, row, refetch, router, dispatch)}
      iconNode={<IconComponent weight="bold" />}
    />
  );
};

// Built-in silence action
const SilenceAction: FC<{ row: UserAction; refetch?: () => void }> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();

  const handleSilence = async () => {
    try {
      await userActionsSilence({
        path: { uuid: row.uuid as any },
      });
      dispatch(
        showSuccess(translate('Action has been silenced successfully.')),
      );
      if (refetch) {
        refetch();
      }
    } catch (e) {
      if (e.response?.status === 404) {
        dispatch(
          showErrorResponse(
            e,
            translate('Action not found or no longer available.'),
          ),
        );
      } else {
        dispatch(showErrorResponse(e, translate('Unable to silence action.')));
      }
    }
  };

  return (
    <ActionItem
      title={translate('Mute')}
      action={handleSilence}
      iconNode={<BellSlashIcon weight="bold" />}
    />
  );
};

// Built-in unsilence action
const UnsilenceAction: FC<{ row: UserAction; refetch?: () => void }> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();

  const handleUnsilence = async () => {
    try {
      await userActionsUnsilence({
        path: { uuid: row.uuid as any },
      });
      dispatch(
        showSuccess(translate('Action has been unsilenced successfully.')),
      );
      if (refetch) {
        refetch();
      }
    } catch (e) {
      if (e.response?.status === 404) {
        dispatch(
          showErrorResponse(
            e,
            translate('Action not found or no longer available.'),
          ),
        );
      } else {
        dispatch(
          showErrorResponse(e, translate('Unable to unsilence action.')),
        );
      }
    }
  };

  return (
    <ActionItem
      title={translate('Unmute')}
      action={handleUnsilence}
      iconNode={<BellIcon weight="bold" />}
    />
  );
};

const RecalculateUserActionsButton: FC<{ refetch?: () => void }> = ({
  refetch,
}) => {
  const dispatch = useDispatch();

  const onClick = async () => {
    try {
      await userActionsUpdateActions();
      dispatch(
        showSuccess(
          translate('User actions have been recalculated successfully.'),
        ),
      );
      if (refetch) {
        refetch();
      }
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to recalculate user actions.')),
      );
    }
  };

  return (
    <ActionItem
      title={translate('Recalculate user actions')}
      action={onClick}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};

const PendingActionAlertItem: FC<{ row: UserAction; refetch?: () => void }> = ({
  row,
  refetch,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Map action_type to valid AlertItem variants
  const getAlertVariant = (
    actionType: string,
  ): 'info' | 'warning' | 'error' => {
    switch (actionType) {
      case 'warning':
        return 'warning';
      case 'error':
      case 'danger':
        return 'error';
      default:
        return 'info';
    }
  };

  // Generate dynamic actions from corrective_actions
  const generateDynamicActions = () => {
    const actions = [];

    // Add corrective actions from backend
    if (row.corrective_actions && Array.isArray(row.corrective_actions)) {
      row.corrective_actions.forEach((action) => {
        actions.push(
          createDynamicAction(action, row, refetch, router, dispatch),
        );
      });
    }

    // Add conditional silence/unsilence action
    if (row.is_effectively_silenced) {
      // Show unmute action for silenced actions
      actions.push(() => <UnsilenceAction row={row} refetch={refetch} />);
    } else {
      // Show mute action for non-silenced actions
      actions.push(() => <SilenceAction row={row} refetch={refetch} />);
    }

    return actions;
  };

  return (
    <AlertItem
      variant={getAlertVariant(row.action_type || 'info')}
      title={
        <div className="d-flex align-items-center gap-2">
          {row.title}
          {row.is_effectively_silenced && (
            <Tip
              label={
                row.is_silenced
                  ? translate('This action has been permanently silenced')
                  : translate('This action has been temporarily silenced')
              }
              id="silenced-action-tooltip"
            >
              <Badge variant="secondary" size="sm" pill onlyIcon>
                <BellSlashIcon size={12} weight="bold" />
              </Badge>
            </Tip>
          )}
        </div>
      }
      titleAfter={
        <Badge
          variant={
            { info: 'default', warning: 'warning', error: 'danger' }[
              row.action_type as string
            ] || 'default'
          }
          size="sm"
          pill
          outline
        >
          {formatDateTime(row.due_date)}
        </Badge>
      }
      body={
        <div>
          {row.description}
          <ActionContext row={row} />
          {row.silenced_until && (
            <div className="text-muted mt-1 small">
              <BellSlashIcon size={14} className="me-1" weight="bold" />
              {translate('Silenced until')} {formatDateTime(row.silenced_until)}
            </div>
          )}
        </div>
      }
      actions={
        <ActionsDropdown
          row={row}
          actions={generateDynamicActions()}
          labeled
          variant="text-secondary"
          drop="down"
        />
      }
      className={row.is_effectively_silenced ? 'opacity-75' : undefined}
    />
  );
};

// Form wrapper for filters
const PendingActionsFilterForm = reduxForm<any, any>({
  form: USER_PENDING_ACTIONS_FILTER_FORM_ID,
})(PendingActionsFilter);

// Selector to map form values to API filter
const mapStateToFilter = createSelector(
  (state, formId) => getFormValues(formId)(state),
  (filters: PendingActionsFilter) => {
    const filter: any = {};
    if (filters?.include_silenced) {
      filter.include_silenced = 'true';
    }
    return filter;
  },
);

export const UserPendingActionsList: FC<OwnProps> = () => {
  const filter = useSelector((state) =>
    mapStateToFilter(state, USER_PENDING_ACTIONS_FILTER_FORM_ID),
  );

  const tableProps = useTable({
    table: 'UserPendingActions',
    fetchData: createFetcher(userActionsList),

    filter,
  });

  const GridItemWithRefetch = (props: { row: UserAction }) => (
    <PendingActionAlertItem row={props.row} refetch={tableProps.fetch} />
  );

  return (
    <Table
      {...tableProps}
      showPageSizeSelector
      title={translate('Pending actions')}
      verboseName={translate('Pending actions')}
      fullWidth
      gridItem={GridItemWithRefetch}
      gridSize={{ xs: 12 }}
      gridSpace={0}
      initialMode="grid"
      bodyClassName="pt-0"
      minHeight="auto"
      tableActions={<RecalculateUserActionsButton refetch={tableProps.fetch} />}
      filters={<PendingActionsFilterForm />}
    />
  );
};
