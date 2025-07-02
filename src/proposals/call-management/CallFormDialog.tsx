import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';
import {
  callManagingOrganisationsList,
  proposalProtectedCallsCreate,
  proposalProtectedCallsPartialUpdate,
} from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import MarkdownEditor from '@waldur/form/MarkdownEditor';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

interface FormData {
  name: string;
  description: string;
  manager: string;
}

export const CallFormDialog = connect<{}, {}, { resolve: { call?; refetch } }>(
  (_, ownProps) => ({
    initialValues: ownProps.resolve?.call,
  }),
)(
  reduxForm<FormData, { resolve: { call?; refetch } }>({
    form: 'ProposalCallForm',
  })((props) => {
    const customer = useSelector(getCustomer);
    const router = useRouter();
    const {
      data: manager,
      isLoading: loadingManager,
      error: errorManager,
      refetch,
    } = useQuery({
      queryKey: ['CallManagingOrganizations', customer.uuid],

      queryFn: () =>
        callManagingOrganisationsList({
          query: { customer_uuid: customer.uuid },
        }).then((response) => response.data[0]),

      staleTime: 60 * 1000,
    });
    const isEdit = Boolean(props.resolve.call?.uuid);

    useEffect(() => {
      if (manager && !isEdit) {
        props.change('manager', manager.url);
      }
    }, [manager, isEdit]);

    const processRequest = React.useCallback(
      (values: FormData, dispatch) => {
        let action;
        if (isEdit) {
          action = proposalProtectedCallsPartialUpdate({
            body: values,
            path: { uuid: props.resolve.call.uuid },
          });
        } else {
          action = proposalProtectedCallsCreate({ body: values });
        }

        return action
          .then((res) => {
            if (isEdit) props.resolve.refetch();
            dispatch(
              showSuccess(
                isEdit
                  ? translate('The call has been updated.')
                  : translate('The call has been created.'),
              ),
            );
            dispatch(closeModalDialog());
            if (!isEdit && res.data?.uuid) {
              router.stateService.go('protected-call.main', {
                call_uuid: res.data.uuid,
              });
            }
          })
          .catch((e) => {
            dispatch(
              showErrorResponse(
                e,
                isEdit
                  ? translate('Unable to update call.')
                  : translate('Unable to create call.'),
              ),
            );
            if (e.response && e.response.status === 400) {
              throw new SubmissionError(e.response.data);
            }
          });
      },
      [props.resolve, router],
    );

    if (loadingManager) {
      return <LoadingSpinner />;
    } else if (errorManager) {
      return (
        <LoadingErred
          message={translate('Unable to prepare the form.')}
          loadData={refetch}
        />
      );
    }
    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          title={
            isEdit
              ? translate('Edit {title}', {
                  title: props.resolve.call.name,
                })
              : translate('Create call')
          }
          closeButton
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={isEdit ? translate('Edit') : translate('Create')}
            />
          }
        >
          <FormContainer submitting={props.submitting} className="size-lg">
            <StringField
              label={translate('Name')}
              name="name"
              required
              validate={required}
            />

            {isEdit && (
              <MarkdownEditor
                name="description"
                required
                autoFocus
                hideLabel
                spaceless
              />
            )}
            {isEdit && isFeatureVisible(MarketplaceFeatures.call_only) && (
              <StringField
                label={translate('External URL')}
                name="external_url"
                required
                validate={required}
              />
            )}
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
