import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

import { AddOfferingButton } from './AddOfferingButton';

const TwoDocumentsIllustration: string = require('@waldur/images/table-placeholders/undraw_no_data_qbuo.svg');

export const CallOfferingsTablePlaceholder = ({ call, refetch }) => {
  return (
    <ImageTablePlaceholder
      illustration={TwoDocumentsIllustration}
      title={translate('Nothing to see here')}
      action={<AddOfferingButton call={call} refetch={refetch} />}
    />
  );
};
