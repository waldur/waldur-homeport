import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table-react/ImageTablePlaceholder';

const Illustration = require('@waldur/images/table-placeholders/undraw_empty_xct9.svg');

export const KeysListTablePlaceholder = () => (
  <ImageTablePlaceholder
    illustration={Illustration}
    title={translate(`There are no SSH keys yet.`)}
    description={translate(
      `Public SSH keys will be injected into services that allow key-based access.`,
    )}
  />
);
