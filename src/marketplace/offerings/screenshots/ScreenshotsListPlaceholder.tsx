import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

const Illustration = require('@waldur/images/table-placeholders/undraw_empty_xct9.svg');

export const ScreenshotsListPlaceholder = () => (
  <ImageTablePlaceholder
    illustration={Illustration}
    title={translate("Offering doesn't have screenshots.")}
    description={translate(
      'Please provide visual material describing the Offering',
    )}
  />
);
