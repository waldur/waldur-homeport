import { PlusCircleIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const VendorOfferingMappingDialog = lazyComponent(() =>
  import('./VendorOfferingMappingDialog').then((module) => ({
    default: module.VendorOfferingMappingDialog,
  })),
);

interface VendorOfferingMappingCreateButtonProps {
  settings?: { uuid: string } | null;
  refetch: () => void;
}

export const VendorOfferingMappingCreateButton = ({
  settings,
  refetch,
}: VendorOfferingMappingCreateButtonProps) => {
  const { openDialog } = useModal();

  return (
    <BaseButton
      label={translate('Add mapping')}
      onClick={() =>
        openDialog(VendorOfferingMappingDialog, {
          resolve: { settings, refetch },
        })
      }
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      disabled={!settings?.uuid}
      disabledReason={translate('Settings UUID is required')}
      size="lg"
    />
  );
};
