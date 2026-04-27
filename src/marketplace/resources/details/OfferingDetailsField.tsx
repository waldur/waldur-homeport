import { useDispatch } from 'react-redux';
import { PublicOfferingDetails } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { Tip } from '@/core/Tooltip';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { Field } from '@/resource/summary';

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
  const dispatch = useDispatch();
  return (
    <Field
      label={translate('Offering name')}
      value={
        <>
          <Tip
            label={offering.name?.length > 30 ? offering.name : null}
            id={offering.uuid}
          >
            {truncate(offering.name)}
          </Tip>{' '}
          <button
            className="text-link"
            type="button"
            onClick={() =>
              dispatch(
                openModalDialog(OfferingDetailsDialog, {
                  resolve: { offering, concealBillingInfo },
                  size: 'lg',
                }),
              )
            }
          >
            [{translate('Show offering')}]
          </button>
        </>
      }
    />
  );
};
