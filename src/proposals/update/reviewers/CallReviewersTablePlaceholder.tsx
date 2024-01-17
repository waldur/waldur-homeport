import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

import { EditReviewersButton } from './EditReviewersButton';

const TwoDocumentsIllustration: string = require('@waldur/images/table-placeholders/undraw_no_data_qbuo.svg');

export const CallReviewersTablePlaceholder = () => {
  return (
    <ImageTablePlaceholder
      illustration={TwoDocumentsIllustration}
      title={translate('Nothing to see here')}
      description={translate('You can edit reviewers for this call.')}
      action={<EditReviewersButton />}
    />
  );
};
