import { FC } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const EventSubscriptionFormDialog = lazyComponent(() =>
  import('./EventSubscriptionForm').then((module) => ({
    default: module.EventSubscriptionForm,
  })),
);

interface EventSubscriptionCreateButtonProps {
  refetch: () => void;
}

export const EventSubscriptionCreateButton: FC<
  EventSubscriptionCreateButtonProps
> = ({ refetch }) => (
  <CreateModalButton
    dialog={EventSubscriptionFormDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
