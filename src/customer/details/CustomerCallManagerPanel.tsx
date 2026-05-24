import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  callManagingOrganisationsCreate,
  callManagingOrganisationsDestroy,
  callManagingOrganisationsList,
} from 'waldur-js-client';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { setCurrentCustomer } from '@/workspace/actions';
import { useCustomer } from '@/workspace/hooks';

import { getCustomer as getCustomerApi } from '../utils';

export const CustomerCallManagerPanel: FunctionComponent = () => {
  const customer = useCustomer();
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

  const { mutate: toggleCallManager, isPending: loadingToggle } =
    useManagedMutation<any, any, boolean>({
      mutationFn: async (value: boolean) => {
        if (value) {
          const result = await callManagingOrganisationsCreate({
            body: {
              customer: customer.url,
              description: '',
              image: null,
            },
          }).then((response) => response.data);
          setInfoUuid(result.uuid);
          return result;
        } else {
          if (!infoUuid) return null;
          const result = await callManagingOrganisationsDestroy({
            path: { uuid: infoUuid },
          });
          return result;
        }
      },
      confirmation: {
        title: translate('Confirmation'),
        body: (value) =>
          value
            ? translate(
                'Are you sure you want to allow this organization to manage calls?',
              )
            : translate(
                'Are you sure you want to prohibit this organization from managing calls?',
              ),
      },
      errorMessage: translate('Unable to perform operation.'),
      onSuccess: async () => {
        const newCustomer = await getCustomerApi(customer.uuid);
        dispatch(setCurrentCustomer(newCustomer));
      },
    });

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
