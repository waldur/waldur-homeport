import { useRouter } from '@uirouter/react';
import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

export const CreateSecurityGroupButton = ({ tenantUUID }) => {
  const router = useRouter();

  const dispatch = useDispatch();

  const gotoTenant = React.useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Sure? Form data would be lost'),
      );
    } catch {
      return;
    }
    router.stateService.go('resources.details', {
      resource_type: 'OpenStack.Tenant',
      uuid: tenantUUID,
      tab: 'security_groups',
    });
  }, [router, dispatch, tenantUUID]);

  if (!tenantUUID) {
    return null;
  }

  return (
    <CreateResourceFormGroup>
      <Button onClick={gotoTenant}>
        <i className="fa fa-plus" /> {translate('Add security group')}
      </Button>
    </CreateResourceFormGroup>
  );
};
