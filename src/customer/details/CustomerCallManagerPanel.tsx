import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import {
  callManagingOrganisationsCreate,
  callManagingOrganisationsDestroy,
  callManagingOrganisationsList,
  callManagingOrganisationsPartialUpdate,
} from 'waldur-js-client';

import {
  Switch,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { EditFieldProvider, NumberEditField } from '@/form/editFields';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useCustomer, useSetCustomer } from '@/workspace/hooks';

import { getCustomer as getCustomerApi } from '../utils';

/** The limit a submitted edit sets: an emptied field (the number field
 * submits null) sets none. */
export const parseApplicantLimit = (
  value: number | string | null | undefined,
): number | null => (value == null || value === '' ? null : Number(value));

export const CustomerCallManagerPanel: FunctionComponent = () => {
  const customer = useCustomer();
  const setCurrentCustomer = useSetCustomer();

  const {
    data: organizations,
    error: errorInfo,
    refetch,
  } = useQuery({
    queryKey: ['callManagingOrganization', customer.uuid],

    queryFn: () =>
      callManagingOrganisationsList({
        query: { customer_uuid: customer.uuid },
      }).then((response) => response.data),
  });

  const { mutate: toggleCallManager, isPending: loadingToggle } =
    useManagedMutation<any, any, boolean>({
      mutationFn: async (value: boolean) => {
        if (value) {
          return await callManagingOrganisationsCreate({
            body: {
              customer: customer.url,
              description: '',
              image: null,
            },
          }).then((response) => response.data);
        } else {
          // The customer names its organization: no list has to have loaded.
          return await callManagingOrganisationsDestroy({
            path: { uuid: customer.call_managing_organization_uuid },
          });
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
        setCurrentCustomer(newCustomer);
        await refetch();
      },
    });

  // Matched by uuid, so a list fetched before the switch was toggled never
  // stands in for the organization the customer now has.
  const organization = organizations?.find(
    (item) => item.uuid === customer.call_managing_organization_uuid,
  );

  const updateOrganization = async (values: {
    max_active_proposals_per_applicant?: number | string | null;
  }) => {
    await callManagingOrganisationsPartialUpdate({
      path: { uuid: organization.uuid },
      body: {
        max_active_proposals_per_applicant: parseApplicantLimit(
          values.max_active_proposals_per_applicant,
        ),
      },
    });
    await refetch();
  };

  return (
    <Card bordered>
      <CardHeader>
        <CardTitle as="div">
          <h3 className="me-1.5">{translate('Call manager')}</h3>
          {loadingToggle && <LoadingSpinner />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {errorInfo && <LoadingErred loadData={refetch} />}
        {/* One list either way, so the switch is not remounted when the
            organization loads under it. */}
        <EditFieldProvider
          scope={organization ?? {}}
          callback={updateOrganization}
        >
          <PropertyList>
            <PropertyItem
              label={translate('Manages calls')}
              value={
                <Switch
                  label={translate('Enable call manager')}
                  checked={
                    customer.call_managing_organization_uuid ? true : false
                  }
                  onCheckedChange={toggleCallManager}
                  disabled={loadingToggle}
                />
              }
            />
            {organization && (
              <NumberEditField
                name="max_active_proposals_per_applicant"
                label={translate('Active proposals per applicant')}
                description={translate(
                  'How many proposals an applicant may have under evaluation or running as a project, across all calls of this organization, before they may submit another. Leave empty for no limit.',
                )}
                min={1}
                step={1}
              />
            )}
          </PropertyList>
        </EditFieldProvider>
      </CardContent>
    </Card>
  );
};
