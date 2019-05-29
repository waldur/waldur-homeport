import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table-react/ImageTablePlaceholder';

// tslint:disable-next-line: no-var-requires
const illustration = require('@waldur/images/table-placeholders/undraw_data_report_bi6l.svg');

export const PublicResourcesListPlaceholder = () => (
  <ImageTablePlaceholder
    illustration={illustration}
    title={translate(`No entries to show here`)}
    description={translate(`Seems you don't have any public resources yet`)}
  />
);
