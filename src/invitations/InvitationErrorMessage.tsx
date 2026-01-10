import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import Illustration from '@waldur/images/table-placeholders/undraw_empty_xct9.svg';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

export const InvitationErrorMessage = ({ dismiss }) => (
  <ImageTablePlaceholder
    illustration={<Illustration />}
    title={translate('Invitation is not valid')}
    description={translate(
      "You've either entered invalid URL or don't have enough permissions to view this page.",
    )}
    action={
      <SubmitButton
        submitting={false}
        type="button"
        onClick={dismiss}
        label={translate('Go to profile')}
      />
    }
  />
);
