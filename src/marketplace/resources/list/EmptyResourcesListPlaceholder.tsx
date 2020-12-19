import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

const Illustration = require('@waldur/images/table-placeholders/undraw_empty_xct9.svg');

export const EmptyResourcesListPlaceholder: FunctionComponent = () => (
  <ImageTablePlaceholder
    illustration={Illustration}
    title={translate(`You do not have any resources yet.`)}
    description={translate(`Resources represent the services you are using.`)}
  />
);
