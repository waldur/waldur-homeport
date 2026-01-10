import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const AnnouncementError = ({ refetch }) => (
  <div className="bar bar-warning">
    <div>
      <p>
        {translate('Unable to load announcements')}
        <SubmitButton
          submitting={false}
          type="button"
          variant="text"
          onClick={() => refetch()}
          label={translate('Retry')}
        />
      </p>
    </div>
  </div>
);
