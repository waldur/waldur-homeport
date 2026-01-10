import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const GroupInvitationButtons = ({ dismiss, submitRequest }) => (
  <>
    <SubmitButton
      submitting={false}
      type="button"
      onClick={dismiss}
      variant="secondary"
      label={translate('Cancel')}
    />
    <SubmitButton
      submitting={false}
      type="button"
      variant="primary"
      onClick={submitRequest}
      label={translate('Submit')}
    />
  </>
);
