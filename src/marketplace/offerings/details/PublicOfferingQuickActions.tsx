import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/marketplace/resources/details/ActionButton';

export const PublicOfferingQuickActions = () => {
  return (
    <div className="d-flex justify-content-between flex-wrap gap-2">
      <div className="d-flex gap-2">
        <ActionButton title="play" iconClass="fa-play" />
        <ActionButton title="pause" iconClass="fa-pause" />
        <ActionButton title="users" iconClass="fa-users" />
        <ActionButton title="folder open" iconClass="fa-folder-open" />
      </div>
      <Button variant="dark">{translate('Publish')}</Button>
    </div>
  );
};
