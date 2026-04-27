import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import Illustration from '@/images/table-placeholders/undraw_data_report_bi6l.svg';
import { ImageTablePlaceholder } from '@/table/ImageTablePlaceholder';

export const CustomerResourcesListPlaceholder: FunctionComponent = () => (
  <ImageTablePlaceholder
    illustration={<Illustration />}
    title={translate('Nothing to show here')}
    description={translate("Seems you don't have any resources yet")}
  />
);
