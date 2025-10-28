import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const AnnouncementError = ({ refetch }) => (
  <div className="bar bar-warning">
    <div>
      <p>
        {translate('Unable to load announcements')}
        <Button variant="text" onClick={() => refetch()}>
          {translate('Retry')}
        </Button>
      </p>
    </div>
  </div>
);
