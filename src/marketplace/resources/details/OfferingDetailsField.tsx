import { PublicOfferingDetails } from 'waldur-js-client';

import { LinkButton, PropertyItem, Tooltip } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const OfferingDetailsDialog = lazyComponent(() =>
  import('@/marketplace/offerings/details/OfferingDetailsDialog').then(
    (module) => ({
      default: module.OfferingDetailsDialog,
    }),
  ),
);

export const OfferingDetailsField = ({
  offering,
  concealBillingInfo,
}: {
  offering: PublicOfferingDetails;
  concealBillingInfo?: boolean;
}) => {
  const { openDialog } = useModal();
  return (
    <PropertyItem
      label={translate('Offering name')}
      value={
        <>
          <Tooltip label={offering.name?.length > 30 ? offering.name : null}>
            <span>{truncate(offering.name)}</span>
          </Tooltip>{' '}
          <LinkButton
            variant="subtle"
            onClick={() =>
              openDialog(OfferingDetailsDialog, {
                resolve: { offering, concealBillingInfo },
                size: 'lg',
              })
            }
          >
            [{translate('Show offering')}]
          </LinkButton>
        </>
      }
    />
  );
};
