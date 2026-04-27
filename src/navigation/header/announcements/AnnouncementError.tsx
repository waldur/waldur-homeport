import { SubmitButton } from '@/form';
import { translate } from '@/i18n';

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
