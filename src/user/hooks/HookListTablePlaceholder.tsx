import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table-react/ImageTablePlaceholder';

const Illustration = require('@waldur/images/table-placeholders/undraw_empty_xct9.svg');

export const HookListTablePlaceholder = () => (
  <ImageTablePlaceholder
    illustration={Illustration}
    title={translate('You have no notifications yet.')}
    description={translate(
      'Notifications allow to be informed when a certain event has occurred.',
    )}
  />
);
