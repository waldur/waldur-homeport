import { PlusCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const AddOrganizationButton = () => {
  const router = useRouter();

  const callback = () => {
    router.stateService.go('organizations-create');
  };

  return (
    <ActionItem
      title={translate('Create organization')}
      action={callback}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};
