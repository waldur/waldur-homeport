import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

type BaseButtonProps = React.ComponentProps<typeof BaseButton>;

type RemovalActionButtonProps = Omit<
  BaseButtonProps,
  'iconNode' | 'variant'
> & {
  /** @deprecated Use `onClick` instead */
  action?: BaseButtonProps['onClick'];
  /** @deprecated Use `label` instead */
  title?: BaseButtonProps['label'];
};

export const RemovalActionButton: FC<RemovalActionButtonProps> = ({
  action,
  title,
  size,
  ...props
}) => (
  <BaseButton
    onClick={action ?? props.onClick}
    label={title ?? props.label}
    size={size ?? 'lg'}
    {...props}
    iconNode={<TrashIcon weight="bold" />}
    variant="danger"
  />
);
