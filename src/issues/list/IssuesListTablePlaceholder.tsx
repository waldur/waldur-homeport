import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table-react/ImageTablePlaceholder';

// tslint:disable-next-line: no-var-requires
const Illustration = require('@waldur/images/table-placeholders/undraw_empty_xct9.svg');

export const IssuesListTablePlaceholder = () => (
  <ImageTablePlaceholder
    illustration={Illustration}
    title={translate(`You haven't created any issues yet.`)}
    // tslint:disable-next-line: max-line-length
    description={translate(`Issues are trackable requests to the operator.`)}
  />
);
