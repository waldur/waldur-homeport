import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import illustration from '@waldur/images/table-placeholders/undraw_data_report_bi6l.svg';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

export const CustomerResourcesListPlaceholder: FunctionComponent = () => (
  <ImageTablePlaceholder
    illustration={illustration}
    title={translate(`Nothing to show here`)}
    description={translate(`Seems you don't have any resources yet`)}
  />
);
