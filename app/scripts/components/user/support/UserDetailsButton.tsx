import * as React from 'react';

import { withTranslation } from '@waldur/i18n/translate';
import ActionButton from '@waldur/table-react/ActionButton';

export const UserDetailsButton = withTranslation(({ translate }) => (
  <ActionButton
    title={translate('Details')}
    action={null}
    icon={'fa fa-icon-info-sign'}/>
));
