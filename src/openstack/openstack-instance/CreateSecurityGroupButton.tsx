import { useRouter } from '@uirouter/react';
import { useCallback, FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

export const CreateSecurityGroupButton: FunctionComponent<{ tenantUUID }> = ({
  tenantUUID,
}) => {
  const router = useRouter();

  const dispatch = useDispatch();

  const gotoTenant = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Sure? Form data would be lost'),
      );
    } catch {
      return;
    }
    router.stateService.go('resource-details', {
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
