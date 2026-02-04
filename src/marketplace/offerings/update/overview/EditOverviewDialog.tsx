import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplaceProviderOfferingsUpdateOverview } from 'waldur-js-client';

import {
  StringField,
  SelectField,
  FormContainer,
  FormFooter,
  TextField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import MarkdownEditor from '@waldur/form/MarkdownEditor';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OVERVIEW_FORM_ID } from './constants';
import { EditOfferingProps } from './types';
import { pickOverview } from './utils';

export const EditOverviewDialog = connect(
  (_, ownProps: { resolve: EditOfferingProps }) => ({
    initialValues: {
      value: ownProps.resolve.offering[ownProps.resolve.attribute.key],
    },
  }),
)(
  reduxForm<{}, { resolve: EditOfferingProps }>({
    form: OVERVIEW_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await marketplaceProviderOfferingsUpdateOverview({
            path: { uuid: props.resolve.offering.uuid },
            body: {
              ...pickOverview(props.resolve.offering),
              [props.resolve.attribute.key]: formData.value,
            },
          });
          dispatch(
            showSuccess(translate('Offering has been updated successfully.')),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update offering.')),
          );
        }
      },
      [dispatch],
    );
    return (
      <form onSubmit={props.handleSubmit(update)}>
        <ModalDialog
          title={props.resolve.attribute.title}
          footer={
            <FormFooter
              submitting={props.submitting}
              submitLabel={translate('Update')}
            />
          }
        >
          <FormContainer
            {...props}
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
    );
  }),
);
