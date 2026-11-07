import { ArchiveIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplaceProviderOfferingsArchive } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useOpenOfferingChange } from '@/marketplace/offerings/dependents/useOpenOfferingChange';
import { ActionItem } from '@/resource/actions/ActionItem';

interface ArchiveOfferingActionProps {
  offering: any;
  refreshOffering(): void;
}

export const ArchiveOfferingAction: FC<ArchiveOfferingActionProps> = ({
  offering,
  refreshOffering,
}) => {
  const openChange = useOpenOfferingChange();
  return (
    <ActionItem
      title={translate('Archive')}
      action={() =>
        openChange({
          title: translate('Archive offering'),
          body: translate(
            'Archived, {name} takes no new orders. Are you sure?',
            { name: offering.name },
          ),
          change: 'offering_withdrawn',
          offeringUuid: offering.uuid,
          confirmLabel: translate('Archive'),
          mutationFn: () =>
            marketplaceProviderOfferingsArchive({
              path: { uuid: offering.uuid },
            }),
          successMessage: translate('Offering state has been updated.'),
          errorMessage: translate('Unable to update offering state.'),
          onSuccess: refreshOffering,
        })
      }
      iconNode={<ArchiveIcon weight="bold" />}
    />
  );
};
