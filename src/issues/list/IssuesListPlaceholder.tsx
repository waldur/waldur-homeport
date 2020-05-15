import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table-react/ImageTablePlaceholder';

const Illustration = require('@waldur/images/table-placeholders/undraw_empty_xct9.svg');

export const IssuesListPlaceholder = () => (
  <ImageTablePlaceholder
    illustration={Illustration}
    title={translate(`You haven't created any issues yet.`)}
    description={translate(`Issues are trackable requests to the operator.`)}
  />
);
