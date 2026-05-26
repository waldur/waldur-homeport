import { InfoIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsUpdateOverview } from 'waldur-js-client';

import { CodePreview } from '@/core/CodePreview';
import { Tip } from '@/core/Tooltip';
import { FormContainer, FormFooter, TextField } from '@/form';
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
          getting_started: formData.template,
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
            footer={
              <FormFooter
                submitting={submitting}
                submitLabel={translate('Update')}
              />
            }
          >
            <Row>
              <Col md={12} lg={8} className="d-flex flex-column">
                <div className="flex-grow-1 min-h-225px">
                  <FormContainer submitting={submitting}>
                    <TextField
                      name="template"
                      rows={15}
                      label={
                        <Tip
                          label={translate(
                            'The following substitution variables are available: {resource_name}, {resource_username}, {backend_id}, {options_key}, {backend_metadata_key}',
                          )}
                          id="template"
                        >
                          {translate('Template')}
                          <InfoIcon
                            size={16}
                            weight="fill"
                            className="text-muted ms-1"
                          />
                        </Tip>
                      }
                    />
                  </FormContainer>
                </div>
              </Col>
              <Col
                xs="auto"
                className="border-end border-gray-300 border-2 mx-5 p-0"
              />

              <Col className="pb-20">
                <div className="form-label">{translate('Preview')}</div>
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
              </Col>
            </Row>
          </ModalDialog>
        </form>
      )}
    />
  );
};
