import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import {
  disableCallManagingOrganization,
  enableCallManagingOrganization,
  organizationCallManagingInfo,
} from '../api';
import { CustomersService } from '../services/CustomersService';

export const CustomerCallManagerPanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const [infoUuid, setInfoUuid] = useState('');
  const dispatch = useDispatch();

  const { error: errorInfo, refetch } = useQuery(
    ['callManagingOrganization', customer.uuid],
    () =>
      organizationCallManagingInfo(customer.uuid).then((data) => {
        if (data) {
          setInfoUuid(data.uuid);
        }
        return data;
      }),
  );

  const [{ loading: loadingToggle }, toggleCallManager] = useAsyncFn<
    any,
    boolean[]
  >(
    async (value: boolean) => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          value
            ? translate(
                'Are you sure you want to allow this organization to manage calls?',
              )
            : translate(
                'Are you sure you want to prohibit this organization from managing calls?',
              ),
        );
      } catch {
        return;
      }
      if (value) {
        const payload = {
          customer: customer.url,
          description: '',
          image: null,
        };
        return enableCallManagingOrganization(payload).then((res) => {
          CustomersService.refreshCurrentCustomer(customer.uuid);
          setInfoUuid(res.uuid);
          return res;
        });
      } else {
        return !infoUuid
          ? null
          : disableCallManagingOrganization(infoUuid).then((res) => {
              CustomersService.refreshCurrentCustomer(customer.uuid);
              return res;
            });
      }
    },
    [infoUuid, customer],
  );

  return (
    <Card className="mt-5">
      <Card.Header>
        <Card.Title>
          <h3 className="me-2">{translate('Call manager')}</h3>
          {loadingToggle && <LoadingSpinner />}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        {errorInfo && <LoadingErred loadData={refetch} />}
        <AwesomeCheckbox
          label={translate('Enable call manager')}
          value={customer.is_call_managing_organization}
          onChange={toggleCallManager}
          disabled={
            (!infoUuid && customer.is_call_managing_organization) ||
            loadingToggle
          }
        />
      </Card.Body>
    </Card>
  );
};
