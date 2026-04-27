import { PlusCircleIcon } from '@phosphor-icons/react';
import { ComponentProps } from 'react';

import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';

interface AddButtonProps extends Omit<
  ComponentProps<typeof ActionButton>,
  'title' | 'variant'
> {}

export const AddButton = (props: AddButtonProps) => {
  return (
    <ActionButton
      title={translate('Add')}
      iconNode={props.iconNode || <PlusCircleIcon weight="bold" />}
      variant="primary"
      {...props}
    />
  );
};
