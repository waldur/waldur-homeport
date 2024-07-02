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
import {
  disableCallManagingOrganization,
  enableCallManagingOrganization,
  getCallManagingOrganization,
} from '@waldur/proposals/api';
import { showErrorResponse } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { refreshCurrentCustomer } from '../api';

export const CustomerCallManagerPanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const [infoUuid, setInfoUuid] = useState('');
  const dispatch = useDispatch();

  const { error: errorInfo, refetch } = useQuery(
    ['callManagingOrganization', customer.uuid],
    () =>
      getCallManagingOrganization(customer.uuid).then((data) => {
        if (data) {
          setInfoUuid(data.uuid);
        }
        return data;
      }),
  );

  const [{ loading: loadingToggle }, toggleCallManager] = useAsyncFn(
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
        try {
          const result = await enableCallManagingOrganization(payload);
          await refreshCurrentCustomer(customer.uuid);
          setInfoUuid(result.uuid);
          return result;
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to perform operation.')),
          );
          throw error;
        }
      } else {
        if (!infoUuid) return null;
        try {
          const result = await disableCallManagingOrganization(infoUuid);
          await refreshCurrentCustomer(customer.uuid);
          return result;
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to perform operation.')),
          );
          throw error;
        }
      }
    },
    [infoUuid, customer],
  );

  return (
    <Card className="card-bordered">
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
          value={customer.call_managing_organization_uuid ? true : false}
          onChange={toggleCallManager}
          disabled={
            !!(
              infoUuid ||
              customer.call_managing_organization_uuid ||
              loadingToggle
            )
          }
        />
      </Card.Body>
    </Card>
  );
};
