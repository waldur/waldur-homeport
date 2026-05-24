import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { Field, Form, useForm } from 'react-final-form';
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
import { FormContainer, SubmitButton } from '@/form';
import MarkdownEditor from '@/form/MarkdownEditor';
import { SelectField } from '@/form/select/SelectField';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { useCustomer } from '@/workspace/hooks';

interface CallFormData {
  name: string;
  description: string;
  manager: string;
  compliance_checklist?: string;
  external_url?: string;
}

interface CallFormDialogProps {
  resolve: { call?; refetch };
}

const ManagerInitializer: FC<{ manager; isEdit: boolean }> = ({
  manager,
  isEdit,
}) => {
  const form = useForm();
  useEffect(() => {
    if (manager && !isEdit) {
      form.change('manager', manager.url);
    }
  }, [manager, isEdit, form]);
  return null;
};

export const CallFormDialog: FC<CallFormDialogProps> = ({
  resolve: { call, refetch: resolveRefetch },
}) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();
  const customer = useCustomer();
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

  const isEdit = Boolean(call?.uuid);

  const initialValues = useMemo(() => call || {}, [call]);

  const processRequest = useCallback(
    async (values: CallFormData) => {
      const requestBody = {
        ...values,
        compliance_checklist:
          (values.compliance_checklist as any)?.value ||
          values.compliance_checklist ||
          null,
      };

      try {
        let res;
        if (isEdit) {
          res = await proposalProtectedCallsPartialUpdate({
            body: requestBody,
            path: { uuid: call.uuid },
          });
        } else {
          res = await proposalProtectedCallsCreate({ body: requestBody });
        }

        if (isEdit) resolveRefetch();
        showSuccess(
          isEdit
            ? translate('The call has been updated.')
            : translate('The call has been created.'),
        );
        closeDialog();
        if (!isEdit && res.data?.uuid) {
          router.stateService.go('protected-call.main', {
            call_uuid: res.data.uuid,
          });
        }
      } catch (e) {
        showErrorResponse(
          e,
          isEdit
            ? translate('Unable to update call.')
            : translate('Unable to create call.'),
        );
        if (e.response && e.response.status === 400) {
          return e.response.data;
        }
      }
    },
    [
      call,
      resolveRefetch,
      router,
      showSuccess,
      showErrorResponse,
      closeDialog,
      isEdit,
    ],
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
    <Form<CallFormData>
      onSubmit={processRequest}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ManagerInitializer manager={manager} isEdit={isEdit} />
          <ModalDialog
            title={
              isEdit
                ? translate('Edit {title}', { title: call.name })
                : translate('Create call')
            }
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
              />
            }
          >
            <FormContainer submitting={submitting} className="size-lg">
              <StringField
                label={translate('Name')}
                name="name"
                required
                validate={required}
              />

              {isEdit && (
                <Field
                  name="description"
                  component={MarkdownEditor}
                  autoFocus
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
      )}
    />
  );
};
