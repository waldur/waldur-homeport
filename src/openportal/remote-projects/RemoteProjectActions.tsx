import {
  CalendarBlankIcon,
  ChatTeardropTextIcon,
  GlobeIcon,
  LinkIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import { RemoteProject } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { DropdownActionItemType } from '@/table/types';

import { AddNoteDialog } from './actions/AddNoteDialog';
import { ApproveNowButton } from './actions/ApproveNowButton';
import { HoldIndefinitelyButton } from './actions/HoldIndefinitelyButton';
import { SetAllowedDomainsDialog } from './actions/SetAllowedDomainsDialog';
import { SetEarliestApproveDialog } from './actions/SetEarliestApproveDialog';
import { SetLinksDialog } from './actions/SetLinksDialog';
import { SetMembershipControlDialog } from './actions/SetMembershipControlDialog';

const AddNoteButton: DropdownActionItemType<RemoteProject> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Add note')}
      action={() =>
        openDialog(AddNoteDialog, { row, resolve: { refetch }, size: 'md' })
      }
      iconNode={<ChatTeardropTextIcon weight="bold" />}
    />
  );
};

const SetAllowedDomainsButton: DropdownActionItemType<RemoteProject> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Set allowed domains')}
      action={() =>
        openDialog(SetAllowedDomainsDialog, {
          row,
          resolve: { refetch },
          size: 'md',
        })
      }
      iconNode={<GlobeIcon weight="bold" />}
    />
  );
};

const SetEarliestApproveButton: DropdownActionItemType<RemoteProject> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Set earliest approve time')}
      action={() =>
        openDialog(SetEarliestApproveDialog, {
          row,
          resolve: { refetch },
          size: 'md',
        })
      }
      iconNode={<CalendarBlankIcon weight="bold" />}
    />
  );
};

const SetLinksButton: DropdownActionItemType<RemoteProject> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Set links')}
      action={() =>
        openDialog(SetLinksDialog, { row, resolve: { refetch }, size: 'lg' })
      }
      iconNode={<LinkIcon weight="bold" />}
    />
  );
};

const SetMembershipControlButton: DropdownActionItemType<RemoteProject> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Set membership control')}
      action={() =>
        openDialog(SetMembershipControlDialog, {
          row,
          resolve: { refetch },
          size: 'md',
        })
      }
      iconNode={<UsersIcon weight="bold" />}
    />
  );
};

interface Props {
  row: RemoteProject;
  refetch: () => void;
}

export const RemoteProjectActions = ({ row, refetch }: Props) => {
  if (!row) {
    return null;
  }

  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        row.state === 'pending' ? ApproveNowButton : null,
        row.state === 'pending' ? HoldIndefinitelyButton : null,
        AddNoteButton,
        SetAllowedDomainsButton,
        SetEarliestApproveButton,
        SetLinksButton,
        SetMembershipControlButton,
      ].filter(Boolean)}
    />
  );
};
