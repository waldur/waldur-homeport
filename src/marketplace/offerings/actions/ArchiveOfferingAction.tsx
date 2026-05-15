import { ArchiveIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplaceProviderOfferingsArchive } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface ArchiveOfferingActionProps {
  offering: any;
  refreshOffering(): void;
}

export const ArchiveOfferingAction: FC<ArchiveOfferingActionProps> = ({
  offering,
  refreshOffering,
}) => {
  const { mutate: archive, isPending } = useManagedMutation({
    mutationFn: () =>
      marketplaceProviderOfferingsArchive({ path: { uuid: offering.uuid } }),
    successMessage: translate('Offering state has been updated.'),
    errorMessage: translate('Unable to update offering state.'),
    onSuccess: refreshOffering,
  });

  return (
    <ActionItem
      title={translate('Archive')}
      action={() => archive()}
      iconNode={<ArchiveIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
