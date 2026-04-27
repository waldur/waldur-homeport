import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';
import {
  callManagingOrganisationsList,
  proposalProtectedCallsAvailableComplianceChecklistsList,
  proposalProtectedCallsCreate,
  proposalProtectedCallsPartialUpdate,
} from 'waldur-js-client';

import { SHORT_STALE_TIME, STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { SubmitButton } from '@/form';
import { FormContainer } from '@/form/FormContainer';
import MarkdownEditor from '@/form/MarkdownEditor';
import { SelectField } from '@/form/SelectField';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { getCustomer } from '@/workspace/selectors';

interface FormData {
  name: string;
  description: string;
  manager: string;
  compliance_checklist?: string;
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

      staleTime: SHORT_STALE_TIME,
    });

    const isExperimentalUiEnabled = isExperimentalUiComponentsVisible();
    const {
      data: complianceChecklists,
      isLoading: loadingChecklists,
      error: errorChecklists,
    } = useQuery({
      queryKey: ['AvailableComplianceChecklists', customer.uuid],
      queryFn: () =>
        proposalProtectedCallsAvailableComplianceChecklistsList({
          query: {
            checklist_type: 'proposal_compliance',
            customer_uuid: customer.uuid,
          },
        }).then((response) => response.data),
      enabled: isExperimentalUiEnabled && !!customer?.uuid,
      staleTime: STALE_TIME,
    });
    const isEdit = Boolean(props.resolve.call?.uuid);

    useEffect(() => {
      if (manager && !isEdit) {
        props.change('manager', manager.url);
      }
    }, [manager, isEdit]);

    const processRequest = React.useCallback(
      (values: FormData, dispatch) => {
        // Transform compliance_checklist from SelectField format {value, label} to just UUID
        const requestBody = {
          ...values,
          compliance_checklist:
            (values.compliance_checklist as any)?.value ||
            values.compliance_checklist ||
            null,
        };

        let action;
        if (isEdit) {
          action = proposalProtectedCallsPartialUpdate({
            body: requestBody,
            path: { uuid: props.resolve.call.uuid },
          });
        } else {
          action = proposalProtectedCallsCreate({ body: requestBody });
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

    if (loadingManager || (isExperimentalUiEnabled && loadingChecklists)) {
      return <LoadingSpinner />;
    } else if (errorManager || (isExperimentalUiEnabled && errorChecklists)) {
      return (
        <LoadingErred
          message={translate('Unable to prepare the form.')}
          loadData={refetch}
        />
      );
    }

    const checklistOptions =
      isExperimentalUiEnabled && complianceChecklists
        ? complianceChecklists.map((checklist) => ({
            value: checklist.uuid,
            label: checklist.name,
          }))
        : [];
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

            {isExperimentalUiComponentsVisible() && (
              <SelectField
                label={translate('Compliance checklist')}
                name="compliance_checklist"
                options={checklistOptions}
                isClearable={true}
                placeholder={translate(
                  'Select compliance checklist (optional)',
                )}
                help_text={translate(
                  'Optional checklist that proposal applicants must complete for compliance evaluation. Can be changed only before any proposals are submitted.',
                )}
              />
            )}
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
