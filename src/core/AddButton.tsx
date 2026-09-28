import { PlusCircleIcon } from '@phosphor-icons/react';
import { ComponentProps } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

type BaseButtonProps = ComponentProps<typeof BaseButton>;

interface AddButtonProps extends Omit<BaseButtonProps, 'label' | 'variant'> {
  /** @deprecated Use `onClick` instead */
  action?: BaseButtonProps['onClick'];
}

export const AddButton = ({ action, ...props }: AddButtonProps) => {
  return (
    <BaseButton
      label={translate('Add')}
      iconNode={props.iconNode || <PlusCircleIcon weight="bold" />}
      variant="primary"
      onClick={action ?? props.onClick}
      {...props}
      size="lg"
    />
  );
};
