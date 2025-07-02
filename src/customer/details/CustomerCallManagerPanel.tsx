import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncFn } from 'react-use';
import {
  callManagingOrganisationsCreate,
  callManagingOrganisationsDestroy,
  callManagingOrganisationsList,
} from 'waldur-js-client';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import { getCustomer as getCustomerApi } from '../utils';

export const CustomerCallManagerPanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const [infoUuid, setInfoUuid] = useState('');
  const dispatch = useDispatch();

  const { error: errorInfo, refetch } = useQuery({
    queryKey: ['callManagingOrganization', customer.uuid],

    queryFn: () =>
      callManagingOrganisationsList({
        query: { customer_uuid: customer.uuid },
      }).then((response) => {
        if (response.data[0]) {
          setInfoUuid(response.data[0].uuid);
        }
        return response.data;
      }),
  });

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
        try {
          const result = await callManagingOrganisationsCreate({
            body: {
              customer: customer.url,
              description: '',
              image: null,
            },
          }).then((response) => response.data);
          const newCustomer = await getCustomerApi(customer.uuid);
          dispatch(setCurrentCustomer(newCustomer));
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
          const result = await callManagingOrganisationsDestroy({
            path: { uuid: infoUuid },
          });
          const newCustomer = await getCustomerApi(customer.uuid);
          dispatch(setCurrentCustomer(newCustomer));
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
          disabled={loadingToggle}
        />
      </Card.Body>
    </Card>
  );
};
