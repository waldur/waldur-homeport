import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const OfferingGroupFormDialog = lazyComponent(() =>
  import('./OfferingGroupFormDialog').then((module) => ({
    default: module.OfferingGroupFormDialog,
  })),
);

interface OfferingGroupCreateButtonProps {
  customerUrl: string;
  refetch: () => void;
}

export const OfferingGroupCreateButton = ({
  customerUrl,
  refetch,
}: OfferingGroupCreateButtonProps) => (
  <CreateModalButton
    dialog={OfferingGroupFormDialog}
    resolve={{ customerUrl, refetch }}
    size="lg"
  />
);
