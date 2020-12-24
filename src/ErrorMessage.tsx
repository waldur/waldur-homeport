import { FallbackRender } from '@sentry/react/dist/errorboundary';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

const Illustration = require('@waldur/images/table-placeholders/undraw_fixing_bugs_w7gi.svg');

export const ErrorMessage: FallbackRender = (props) => (
  <ImageTablePlaceholder
    illustration={Illustration}
    title={translate(`An error has occurred.`)}
    description={props.error.message}
    action={
      <Button onClick={() => location.reload()} bsStyle="success">
        <i className="fa fa-refresh" /> {translate('Reload')}
      </Button>
    }
  />
);
