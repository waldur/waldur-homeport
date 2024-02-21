import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { CreateOfferingButton } from './CreateOfferingButton';

const TwoDocumentsIllustration: string = require('@waldur/images/table-placeholders/undraw_no_data_qbuo.svg');

export const OfferingsListTablePlaceholder = ({ showActions }) => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const showMessage =
    showActions &&
    customer?.is_service_provider &&
    hasPermission(user, {
      permission: PermissionEnum.CREATE_OFFERING,
      customerId: customer.uuid,
    });
  return (
    <ImageTablePlaceholder
      illustration={TwoDocumentsIllustration}
      title={translate('Nothing to see here')}
      description={
        showMessage
          ? translate(
              'You can start filling this table by creating your first offering.',
            )
          : null
      }
      action={showActions && <CreateOfferingButton />}
    />
  );
};
