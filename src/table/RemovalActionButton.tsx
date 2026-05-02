import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { ActionButton } from '@/table/ActionButton';

type ActionButtonProps = React.ComponentProps<typeof ActionButton>;

type RemovalActionButtonProps = Omit<ActionButtonProps, 'iconNode' | 'variant'>;

export const RemovalActionButton: FC<RemovalActionButtonProps> = (props) => (
  <ActionButton
    {...props}
    iconNode={<TrashIcon weight="bold" />}
    variant="danger"
  />
);
