import { FunctionComponent } from 'react';
import { Button, FormGroup } from 'react-bootstrap';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

export const LoadUserDetailsButton: FunctionComponent<{ loading; onClick }> = ({
  loading,
  onClick,
}) =>
  isFeatureVisible('invitation.require_user_details') ? (
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
