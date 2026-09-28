import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

export const AnnouncementError = ({ refetch }) => (
  <div className="bar bar-warning">
    <div>
      <p>
        {translate('Unable to load announcements')}
        <BaseButton
          variant="text-primary"
          onClick={() => refetch()}
          label={translate('Retry')}
          size="lg"
        />
      </p>
    </div>
  </div>
);
