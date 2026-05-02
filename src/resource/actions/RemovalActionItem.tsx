import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { ActionItem, ActionItemProps } from './ActionItem';

type RemovalActionItemProps = Omit<
  ActionItemProps,
  'iconNode' | 'className' | 'iconColor'
>;

export const RemovalActionItem: FC<RemovalActionItemProps> = (props) => (
  <ActionItem
    {...props}
    iconNode={<TrashIcon weight="bold" />}
    className="text-danger"
    iconColor="danger"
  />
);
