import { useRouter } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  getUserCustomerPermissions,
  getUserProjectPermissions,
} from '@waldur/workspace/selectors';
import './WarningBar.scss';

export default function WarningBar() {
  const customerPermissions = useSelector(getUserCustomerPermissions);
  const projectPermissions = useSelector(getUserProjectPermissions);
  const router = useRouter();
  const show =
    customerPermissions.length === 0 &&
    projectPermissions.length === 0 &&
    router.stateService.is('profile.details');

  return show ? (
    <div className="warning_bar">
      <p>
        <strong>{translate('No association')}</strong>:{' '}
        {translate(
          'Your account is not part of any organization. Your view will be restricted.',
        )}
      </p>
    </div>
  ) : null;
}
