import { EyeIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FunctionComponent, MouseEvent } from 'react';

import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CompactActionButton } from '@/table/CompactActionButton';
import { useImpersonate } from '@/user/support/useImpersonate';
import { useUser } from '@/workspace/hooks';

interface UserSearchImpersonateActionProps {
  row: {
    uuid?: string;
    full_name?: string;
    email?: string;
    has_active_session?: boolean;
  };
  close(): void;
}

export const UserSearchImpersonateAction: FunctionComponent<
  UserSearchImpersonateActionProps
> = ({ row, close }) => {
  const user = useUser();
  const router = useRouter();
  const { confirm } = useModal();
  const { impersonate, isPending } = useImpersonate(row.uuid);

  if (!user?.is_staff || row.uuid === user.uuid || !row.has_active_session) {
    return null;
  }

  const handleClick = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Close the search popover first so the confirmation modal is not rendered
    // behind it.
    close();
    try {
      await confirm(
        translate('Impersonate user'),
        translate(
          'Impersonate {name}?',
          { name: <strong>{row.full_name || row.email}</strong> },
          formatJsxTemplate,
        ),
        {
          negativeButton: translate('Cancel'),
          positiveButton: translate('Impersonate'),
          size: 'sm',
        },
      );
    } catch {
      return;
    }
    await impersonate();
    router.stateService.go('profile.details');
  };

  return (
    <CompactActionButton
      title={translate('Impersonate')}
      action={handleClick}
      iconNode={<EyeIcon weight="bold" />}
      pending={isPending}
      variant="text-primary"
    />
  );
};
