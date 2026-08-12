import { FC } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

const HelpdeskSettingsForm = lazyComponent(() =>
  import('./HelpdeskSettingsForm').then((module) => ({
    default: module.HelpdeskSettingsForm,
  })),
);

export const CreateHelpdeskButton: FC<{
  serviceProviderUuid: string;
  refetch: () => void;
}> = ({ serviceProviderUuid, refetch }) => {
  const { openDialog } = useModal();
  // Registering a helpdesk is staff-only (backend create is is_staff-gated).
  const user = useUser();
  if (!user?.is_staff) {
    return null;
  }
  return (
    <AddButton
      action={() =>
        openDialog(HelpdeskSettingsForm, {
          resolve: { serviceProviderUuid, refetch },
        })
      }
    />
  );
};
