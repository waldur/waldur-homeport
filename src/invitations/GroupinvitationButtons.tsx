import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

export const GroupInvitationButtons = ({ dismiss, submitRequest }) => (
  <>
    <BaseButton
      onClick={dismiss}
      variant="secondary"
      label={translate('Cancel')}
      size="lg"
    />
    <BaseButton
      variant="primary"
      onClick={submitRequest}
      label={translate('Submit')}
      size="lg"
    />
  </>
);
