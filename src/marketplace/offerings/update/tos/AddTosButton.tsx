import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const AddTosDialog = lazyComponent(() =>
  import('./AddTosDialog').then((module) => ({
    default: module.AddTosDialog,
  })),
);

export const AddTosButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(AddTosDialog, {
      resolve: { offering, refetch },
    });
  };

  return (
    <BaseButton
      onClick={callback}
      label={translate('Add Terms of Service')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
