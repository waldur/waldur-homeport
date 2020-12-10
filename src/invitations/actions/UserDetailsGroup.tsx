import { FormGroup } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { UserDetails } from './types';

export const UserDetailsGroup = ({
  userDetails,
}: {
  userDetails: UserDetails;
}) =>
  userDetails ? (
    <FormGroup>
      <p>
        <strong>{translate('Full name')}:</strong>
        {userDetails.full_name}
      </p>

      <p>
        <strong>{translate('Native name')}:</strong>
        {userDetails.native_name}
      </p>

      <p>
        <strong>{translate('Organization')}:</strong>
        {userDetails.organization}
      </p>

      <p>
        <strong>{translate('Job title')}:</strong>
        {userDetails.job_title}
      </p>
    </FormGroup>
  ) : null;
