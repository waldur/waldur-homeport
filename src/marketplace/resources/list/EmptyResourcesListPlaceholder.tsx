import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table-react/ImageTablePlaceholder';

const Illustration = require('@waldur/images/table-placeholders/undraw_empty_xct9.svg');

export const EmptyResourcesListPlaceholder = () => (
  <ImageTablePlaceholder
    illustration={Illustration}
    title={translate(`You do not have any resources yet.`)}
    description={translate(`Resources represent the services you are using.`)}
  />
);
