import { QuestionIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

const OpenStackSecurityGroupsDialog = lazyComponent(() =>
  import('./OpenStackSecurityGroupsDialog').then((module) => ({
    default: module.OpenStackSecurityGroupsDialog,
  })),
);

export const OpenStackSecurityGroupsLink = ({ items }) => {
  const { openDialog } = useModal();

  const handleOpenDialog = () => {
    openDialog(OpenStackSecurityGroupsDialog, {
      resolve: { securityGroups: items },
      size: 'lg',
    });
  };

  if (!items?.length) {
    return <>&mdash;</>;
  }

  return (
    <button className="btn btn-link btn-flush" onClick={handleOpenDialog}>
      {items.map((item) => item.name).join(', ')}
      <QuestionIcon size={17} className="ms-1" weight="bold" />
    </button>
  );
};
