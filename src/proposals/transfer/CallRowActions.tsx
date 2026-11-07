import {
  ChatTextIcon,
  ClipboardTextIcon,
  DownloadSimpleIcon,
  ListChecksIcon,
  StackIcon,
} from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CALL_VALIDATION_STATE } from '@/proposals/workflow-check/WorkflowCheckPanel';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { Call } from '../types';
import { canUpdateCall } from '../utils';

const ExportCallDialog = lazyComponent(() =>
  import('./ExportCallDialog').then((m) => ({
    default: m.ExportCallDialog,
  })),
);

const SaveAsTemplateDialog = lazyComponent(() =>
  import('./SaveAsTemplateDialog').then((m) => ({
    default: m.SaveAsTemplateDialog,
  })),
);

interface CallRowActionsProps {
  row: Call;
  refetch(): void;
}

export const CallRowActions: FC<CallRowActionsProps> = ({ row, refetch }) => {
  const user = useUser();
  const { openDialog } = useModal();
  const router = useRouter();

  // Every row action takes the right to edit the call. A user who lacks it on
  // this call never will from this list, so the row gets no menu at all
  // rather than one with nothing usable in it.
  if (!canUpdateCall(user, row)) {
    return null;
  }

  const callOnly = isFeatureVisible(MarketplaceFeatures.call_only);

  return (
    <ActionsDropdown row={row} refetch={refetch}>
      {/* The Proposals and Reviews tabs are not there on a calls-only deployment. */}
      {row.state !== 'draft' && !callOnly && (
        <ActionItem
          title={translate('Proposals')}
          action={() =>
            router.stateService.go('protected-call.manage', {
              call_uuid: row.uuid,
              tab: 'proposals',
            })
          }
          iconNode={<ClipboardTextIcon weight="bold" />}
        />
      )}
      {row.state === 'active' && !callOnly && (
        <ActionItem
          title={translate('Reviews')}
          action={() =>
            router.stateService.go('protected-call.manage', {
              call_uuid: row.uuid,
              tab: 'reviews',
            })
          }
          iconNode={<ChatTextIcon weight="bold" />}
        />
      )}
      {row.state !== 'draft' && (
        <ActionItem
          title={translate('Validation')}
          action={() =>
            router.stateService.go(CALL_VALIDATION_STATE, {
              call_uuid: row.uuid,
            })
          }
          iconNode={<ListChecksIcon weight="bold" />}
        />
      )}
      <ActionItem
        title={translate('Export')}
        action={() => openDialog(ExportCallDialog, { resolve: { call: row } })}
        iconNode={<DownloadSimpleIcon weight="bold" />}
      />
      {/* Staff only: a template carries the call's forms, which publishing
          it shows to every call manager. */}
      {user?.is_staff && (
        <ActionItem
          title={translate('Save as template')}
          action={() =>
            openDialog(SaveAsTemplateDialog, { resolve: { call: row } })
          }
          iconNode={<StackIcon weight="bold" />}
          staff
        />
      )}
    </ActionsDropdown>
  );
};
