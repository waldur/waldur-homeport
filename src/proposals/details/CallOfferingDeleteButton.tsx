import {
  proposalRequestedOfferingsCancel,
  RequestedOffering,
} from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { formatJsxTemplate, translate } from '@waldur/i18n';

export const CallOfferingDeleteButton = ({
  row,
  refetch,
}: {
  row: RequestedOffering;
  refetch(): void;
}) => (
  <DeleteButton
    row={row}
    apiFunction={(r) =>
      proposalRequestedOfferingsCancel({ path: { uuid: r.uuid } })
    }
    refetch={refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the offering {offering_name} ?',
        {
          offering_name: <strong>{r.offering_name}</strong>,
        },
        formatJsxTemplate,
      )
    }
    successMessage={translate('Requested offering has been removed.')}
    errorMessage={translate('Unable to delete requested offering.')}
    title={translate('Remove')}
  />
);
