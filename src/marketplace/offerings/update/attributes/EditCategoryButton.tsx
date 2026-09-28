import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const EditCategoryDialog = lazyComponent(() =>
  import('./EditCategoryDialog').then((module) => ({
    default: module.EditCategoryDialog,
  })),
);

export const EditCategoryButton: FunctionComponent<{
  offering;
  category;
  refetch;
}> = (props) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditCategoryDialog, {
      resolve: props,
    });
  };
  return (
    <BaseButton
      onClick={callback}
      label={translate('Edit category')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
