import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';
import {
  getCustomer,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import { CreateOfferingButton } from './CreateOfferingButton';

const TwoDocumentsIllustration: string = require('@waldur/images/table-placeholders/undraw_no_data_qbuo.svg');

export const OfferingsListTablePlaceholder = ({ showActions }) => {
  const customer = useSelector(getCustomer);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);

  return (
    <ImageTablePlaceholder
      illustration={TwoDocumentsIllustration}
      title={translate('Nothing to see here')}
      description={
        showActions && customer?.is_service_provider && isOwnerOrStaff
          ? translate(
              'You can start filling this table by creating your first offering.',
            )
          : null
      }
      action={showActions && <CreateOfferingButton />}
    />
  );
};
