import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import { useDispatch } from 'react-redux';

import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

export const CreateSecurityGroupButton = props => {
  if (!props.tenantUUID) {
    return null;
  }

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
    $state.go('resources.details', {
      resource_type: 'OpenStack.Tenant',
      uuid: props.tenantUUID,
      tab: 'security_groups',
    });
  }, []);

  return (
    <CreateResourceFormGroup>
      <Button onClick={gotoTenant}>
        <i className="fa fa-plus" /> {translate('Add security group')}
      </Button>
    </CreateResourceFormGroup>
  );
};
