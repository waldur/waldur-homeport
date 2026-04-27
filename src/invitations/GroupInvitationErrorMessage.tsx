import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import Illustration from '@/images/table-placeholders/undraw_empty_xct9.svg';
import { ImageTablePlaceholder } from '@/table/ImageTablePlaceholder';

export const GroupInvitationErrorMessage = ({ dismiss }) => (
  <ImageTablePlaceholder
    illustration={<Illustration />}
    title={translate('Request is not valid.')}
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
