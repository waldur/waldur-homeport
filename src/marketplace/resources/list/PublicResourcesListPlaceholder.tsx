import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import Illustration from '@waldur/images/table-placeholders/undraw_data_report_bi6l.svg';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

export const PublicResourcesListPlaceholder: FunctionComponent = () => (
  <ImageTablePlaceholder
    illustration={<Illustration />}
    title={translate(`No entries to show here`)}
    description={translate(`Seems you don't have any public resources yet`)}
  />
);
