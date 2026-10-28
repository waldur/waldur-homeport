import { InfoIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsUpdateOverview } from 'waldur-js-client';

import { FormHeading, Tooltip } from 'waldur-ui';

import { CodePreview } from '@/core/CodePreview';
import { FormFooter, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { EditOfferingProps } from './types';
import { pickOverview } from './utils';

export const EditGettingStartedDialog: FC<{
  resolve: EditOfferingProps;
}> = (props) => {
  const updateMutation = useManagedMutation<any, any, { template: string }>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateOverview({
        path: { uuid: props.resolve.offering.uuid },
        body: {
          ...pickOverview(props.resolve.offering),
          getting_started: formData.template ?? '',
        },
      }),
    successMessage: translate('Offering has been updated successfully.'),
    errorMessage: translate('Unable to update offering.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form<{ template: string }>
      initialValues={{
        template: props.resolve.offering.getting_started,
      }}
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Getting started instructions')}
            footer={<FormFooter submitLabel={translate('Update')} />}
          >
            <div className="flex flex-wrap">
              <div className="w-full lg:w-8/12 flex flex-col">
                <div className="grow min-h-[225px]">
                  <div>
                    <TextGroup
                      name="template"
                      rows={15}
                      label={
                        <Tooltip
                          label={translate(
                            'The following substitution variables are available: {resource_name}, {resource_username}, {backend_id}, {options_key}, {backend_metadata_key}',
                          )}
                        >
                          <span>
                            {translate('Template')}
                            <InfoIcon
                              size={16}
                              weight="fill"
                              className="text-quaternary ms-1"
                            />
                          </span>
                        </Tooltip>
                      }
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
              <div className="flex-none border-e-2 border-divider-medium mx-4 p-0" />

              <div className="flex-1 min-w-0 pb-16">
                <FormHeading as="p">{translate('Preview')}</FormHeading>
                <CodePreview
                  template={values.template}
                  context={{
                    resource_name: 'RESOURCE_NAME',
                    resource_username: 'RESOURCE_USERNAME',
                    backend_id: 'BACKEND_ID',
                    options_key: 'OPTIONS_VALUE',
                    backend_metadata_key: 'BACKEND_METADATA_VALUE',
                  }}
                />
              </div>
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
