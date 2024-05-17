import { translate } from '@waldur/i18n';
import TwoDocumentsIllustration from '@waldur/images/table-placeholders/undraw_no_data_qbuo.svg';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

import { AddOfferingButton } from './AddOfferingButton';

export const CallOfferingsTablePlaceholder = ({ call, refetch }) => {
  return (
    <ImageTablePlaceholder
      illustration={TwoDocumentsIllustration}
      title={translate('Nothing to see here')}
      action={<AddOfferingButton call={call} refetch={refetch} />}
    />
  );
};
