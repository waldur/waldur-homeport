import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

const TwoDocumentsIllustration: string = require('@waldur/images/table-placeholders/undraw_no_data_qbuo.svg');

export const CallInvitationsListPlaceholder = () => (
  <ImageTablePlaceholder
    illustration={TwoDocumentsIllustration}
    title={translate('Nothing to see here')}
    description={translate('You can see invitations for this call.')}
  />
);
