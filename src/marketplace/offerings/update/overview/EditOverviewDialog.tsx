import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsUpdateOverview } from 'waldur-js-client';

import {
  StringField,
  SelectField,
  FormContainer,
  FormFooter,
  TextField,
} from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import MarkdownEditor from '@/form/MarkdownEditor';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { EditOfferingProps } from './types';
import { pickOverview } from './utils';

export const EditOverviewDialog: FC<{
  resolve: EditOfferingProps;
}> = (props) => {
  const initialValues = useMemo(
    () => ({
      value: props.resolve.offering[props.resolve.attribute.key],
    }),
    [props.resolve.offering, props.resolve.attribute.key],
  );

  const updateOfferingMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateOverview({
        path: { uuid: props.resolve.offering.uuid },
        body: {
          ...pickOverview(props.resolve.offering),
          [props.resolve.attribute.key]: formData.value,
        },
      }),
    successMessage: translate('Offering has been updated successfully.'),
    errorMessage: translate('Unable to update offering.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => updateOfferingMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={props.resolve.attribute.title}
            footer={
              <FormFooter
                submitting={submitting}
                submitLabel={translate('Update')}
              />
            }
          >
            <FormContainer
              submitting={submitting}
              className={
                props.resolve.attribute.type === 'html' ? 'size-lg' : undefined
              }
            >
              {props.resolve.attribute.type === 'html' ? (
                <MarkdownEditor name="value" autoFocus hideLabel spaceless />
              ) : props.resolve.attribute.type === 'text' ? (
                <TextField name="value" hideLabel spaceless />
              ) : props.resolve.attribute.type === 'boolean' ? (
                <AwesomeCheckboxField
                  name="value"
                  label={props.resolve.attribute.title}
                  hideLabel
                />
              ) : props.resolve.attribute.type === 'list' ? (
                <SelectField
                  name="value"
                  options={props.resolve.attribute.options}
                  multi={true}
                  simpleValue={true}
                  hideLabel
                />
              ) : (
                <StringField
                  name="value"
                  maxLength={props.resolve.attribute.maxLength}
                  hideLabel
                  spaceless
                />
              )}
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
