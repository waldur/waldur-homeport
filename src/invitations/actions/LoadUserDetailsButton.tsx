import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';

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
