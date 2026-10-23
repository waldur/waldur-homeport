import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { useUser } from '@/workspace/hooks';

const AddUserRoleDialog = lazyComponent(() =>
  import('./AddUserRoleDialog').then((module) => ({
    default: module.AddUserRoleDialog,
  })),
);

interface AddUserRoleButtonProps {
  user: {
    uuid: string;
    full_name?: string;
    username: string;
  };
  refetch?: () => void;
}

/** Staff-only. Support can see grants but cannot grant from this screen. */
export const AddUserRoleButton = ({
  user,
  refetch,
}: AddUserRoleButtonProps) => {
  const currentUser = useUser();
  if (!currentUser?.is_staff) {
    return null;
  }

  return (
    <CreateModalButton
      dialog={AddUserRoleDialog}
      resolve={{ user, refetch }}
      size="md"
    />
  );
};
