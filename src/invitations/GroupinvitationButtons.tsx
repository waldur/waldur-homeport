import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const GroupInvitationButtons = ({ dismiss, submitRequest }) => (
  <>
    <Button variant="primary" onClick={submitRequest}>
      {translate('Submit')}
    </Button>
    <Button onClick={dismiss} variant="secondary">
      {translate('Cancel')}
    </Button>
  </>
);
