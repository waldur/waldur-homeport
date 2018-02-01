import * as React from 'react';

import { withTranslation } from '@waldur/i18n/translate';
import ActionButton from '@waldur/table-react/ActionButton';

const UserDetailsButton = ({ translate }) => (
  <ActionButton
    title={translate('Details')}
    action={null}
    icon={'fa fa-icon-info-sign'}/>
);

export default withTranslation(UserDetailsButton);
