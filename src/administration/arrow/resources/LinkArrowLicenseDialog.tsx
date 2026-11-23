import { Form } from 'react-final-form';
import {
  adminArrowCustomerMappingsLinkResource,
  adminArrowCustomerMappingsList,
  type Resource,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { format } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import { StringGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { getArrowLicense } from './arrowLicense';

interface LinkArrowLicenseDialogProps {
  resolve: { resource: Resource; refetch?: () => void };
}

interface FormValues {
  license_reference: string;
}

/**
 * Link a resource to an Arrow license through its organization's customer
 * mapping, so consumption and billing lines are matched to it. Setting the
 * backend ID by hand does not do that.
 */
export const LinkArrowLicenseDialog = ({
  resolve,
}: LinkArrowLicenseDialogProps) => {
  const { resource, refetch } = resolve;

  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: async (values) => {
      const { data: mappings } = await adminArrowCustomerMappingsList({
        query: {
          waldur_customer_uuid: resource.customer_uuid,
          is_active: true,
        },
      });
      const mapping = mappings?.[0];
      if (!mapping) {
        throw new Error(
          translate(
            'The organization {organization} is not mapped to an Arrow customer. Map it on the Customer Mappings tab first.',
            { organization: resource.customer_name },
          ),
        );
      }
      return adminArrowCustomerMappingsLinkResource({
        path: { uuid: mapping.uuid },
        body: {
          resource_uuid: resource.uuid,
          license_reference: values.license_reference.trim(),
        },
      });
    },
    successMessage: translate('Resource linked to Arrow license'),
    refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => {})}
      initialValues={{ license_reference: getArrowLicense(resource) || '' }}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Link to Arrow license')}
            subtitle={resource.name}
            footer={
              <>
                <CloseDialogButton
                  variant="secondary"
                  label={translate('Cancel')}
                />
                <SubmitButton
                  submitting={mutation.isPending}
                  disabled={invalid}
                  label={translate('Link')}
                />
              </>
            }
          >
            <StringGroup
              name="license_reference"
              label={translate('Arrow license')}
              description={translate(
                'The ArrowSphere license reference (XSP…). Consumption and billing lines for this license will be billed through this resource.',
              )}
              validate={required}
              required
            />
            {mutation.error && (
              <AlertItem
                type="floating"
                variant="error"
                title={format(mutation.error) || mutation.error.message}
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
