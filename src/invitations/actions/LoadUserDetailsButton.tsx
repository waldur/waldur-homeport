import { FunctionComponent } from 'react';
import { Button, FormGroup } from 'react-bootstrap';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { InvitationsFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';

export const LoadUserDetailsButton: FunctionComponent<{ loading; onClick }> = ({
  loading,
  onClick,
}) =>
  isFeatureVisible(InvitationsFeatures.require_user_details) ? (
    <FormGroup>
      <Button variant="primary" disabled={loading} onClick={onClick}>
        {loading && (
          <>
            <LoadingSpinnerIcon className="me-1" />{' '}
          </>
        )}
        {translate('Show user details')}
      </Button>
    </FormGroup>
  ) : null;
