import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import DocumentSearchIllustration from '@waldur/images/table-placeholders/undraw_file_searching_duff.svg';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

export const OrderTablePlaceholder: FunctionComponent = () => (
  <ImageTablePlaceholder
    illustration={<DocumentSearchIllustration />}
    title={translate(`Seems there's nothing here`)}
    description={translate(
      `You can find offerings to order in the marketplace`,
    )}
    action={
      <Link
        state="public.marketplace-landing"
        className="btn btn-success btn-md"
      >
        {translate('Go to marketplace')}
      </Link>
    }
  />
);
