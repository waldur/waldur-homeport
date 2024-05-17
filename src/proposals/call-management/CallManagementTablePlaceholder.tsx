import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import Illustration from '@waldur/images/table-placeholders/undraw_empty_xct9.svg';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

export const CallManagementTablePlaceholder: FunctionComponent = () => (
  <ImageTablePlaceholder
    illustration={Illustration}
    title={translate(`There are no proposal calls yet.`)}
  />
);
