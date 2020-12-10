import { Button, FormGroup } from 'react-bootstrap';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const LoadUserDetailsButton = ({ loading, onClick }) =>
  ENV.invitationRequireUserDetails ? (
    <FormGroup>
      <Button bsStyle="primary" disabled={loading} onClick={onClick}>
        {loading && (
          <>
            <i className="fa fa-spinner fa-spin m-r-xs" />{' '}
          </>
        )}
        {translate('Show user details')}
      </Button>
    </FormGroup>
  ) : null;
