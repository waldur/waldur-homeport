import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import Illustration from '@waldur/images/table-placeholders/undraw_empty_xct9.svg';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

export const UserOfferingListPlaceholder: FunctionComponent = () => (
  <ImageTablePlaceholder
    illustration={<Illustration />}
    title={translate(`There are no remote accounts yet.`)}
    description={translate(
      `Remote accounts are used for accessing external services you have access to.`,
    )}
  />
);
