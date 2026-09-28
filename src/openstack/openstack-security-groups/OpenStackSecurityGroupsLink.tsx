import { QuestionIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

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
    <BaseButton
      variant="text-primary"
      onClick={handleOpenDialog}
      label={items.map((item) => item.name).join(', ')}
      iconNode={<QuestionIcon size={17} weight="bold" />}
      iconRight
    />
  );
};
