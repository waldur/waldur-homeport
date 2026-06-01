import { FC, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import { marketplaceProviderOfferingsUpdateOverview } from 'waldur-js-client';

import {
  FormFooter,
  TextGroup,
  BooleanGroup,
  SelectGroup,
  StringGroup,
} from '@/form';
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
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={props.resolve.attribute.title}
            footer={<FormFooter submitLabel={translate('Update')} />}
          >
            <div
              className={
                props.resolve.attribute.type === 'html' ? 'size-lg' : undefined
              }
            >
              {props.resolve.attribute.type === 'html' ? (
                <Field
                  name="value"
                  component={MarkdownEditor}
                  offeringUuid={
                    ['description', 'full_description'].includes(
                      props.resolve.attribute.key,
                    )
                      ? props.resolve.offering.uuid
                      : undefined
                  }
                  autoFocus
                  hideLabel
                  spaceless
                />
              ) : props.resolve.attribute.type === 'text' ? (
                <TextGroup name="value" hideLabel spaceless />
              ) : props.resolve.attribute.type === 'boolean' ? (
                <BooleanGroup
                  name="value"
                  label={props.resolve.attribute.title}
                  hideLabel
                />
              ) : props.resolve.attribute.type === 'list' ? (
                <SelectGroup
                  name="value"
                  options={props.resolve.attribute.options}
                  multi={true}
                  simpleValue={true}
                  hideLabel
                />
              ) : (
                <StringGroup
                  name="value"
                  maxLength={props.resolve.attribute.maxLength}
                  hideLabel
                  spaceless
                />
              )}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
