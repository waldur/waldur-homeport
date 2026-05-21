import { pick } from 'lodash-es';
import { Field, Form } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import { projectsPartialUpdate } from 'waldur-js-client';

import { formatISODate } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { useCustomerProjects } from '@/customer/workspace/fetchCustomer';
import { SubmitButton } from '@/form';
import MarkdownEditor from '@/form/MarkdownEditor';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { setCurrentProject } from '@/workspace/actions';
import { getCustomer } from '@/workspace/selectors';

import { EndDateGroup } from '../create/EndDateGroup';
import { IndustryGroup } from '../create/IndustryGroup';
import { KindGroup } from '../create/KindGroup';
import { NameGroup } from '../create/NameGroup';
import { OecdCodeGroup } from '../create/OecdCodeGroup';
import { ScienceDomainGroup } from '../create/ScienceDomainGroup';
import { StartDateGroup } from '../create/StartDateGroup';
import { EditProjectProps } from '../types';

const getFieldTitle = (key: string): string => {
  switch (key) {
    case 'customer_name':
      return translate('Project owner');
    case 'name':
      return translate('Name');
    case 'description':
      return translate('Description');
    case 'is_industry':
      return translate('Industry');
    case 'start_date':
      return translate('Start date');
    case 'end_date':
      return translate('End date');
    case 'oecd_fos_2007_code':
      return translate('OECD code');
    case 'backend_id':
      return translate('Backend ID');
    case 'slug':
      return translate('Slug');
    case 'staff_notes':
      return translate('Staff notes');
    case 'kind':
      return translate('Project kind');
    case 'max_service_accounts':
      return translate('Maximum number of service accounts');
    case 'grace_period_days':
      return translate('Grace period (days)');
    default:
      return translate('Edit');
  }
};

const formatValue = (key, value) => {
  if (['', undefined, null].includes(value)) {
    // For markdown fields, return empty string instead of null
    if (key === 'description' || key === 'staff_notes') {
      return '';
    }
    return null;
  }
  switch (key) {
    case 'end_date':
    case 'start_date':
      return formatISODate(value);
    case 'oecd_fos_2007_code':
      return value.value;
    case 'science_sub_domain':
      return value?.uuid ?? null;
    default:
      return value;
  }
};

export const EditFieldDialog = ({ resolve }: { resolve: EditProjectProps }) => {
  const dispatch = useDispatch();

  const customer = useSelector(getCustomer);
  const { loading: loadingProjects } = useCustomerProjects();

  const updateMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      projectsPartialUpdate({
        path: { uuid: resolve.project.uuid },
        body: {
          [resolve.name]: formatValue(resolve.name, formData[resolve.name]),
        },
      }),
    successMessage: translate('Project has been updated.'),
    errorMessage: translate('Project could not be updated.'),
    onSuccess: (response: any) => {
      dispatch(setCurrentProject(response.data));
    },
  });

  return (
    <Form
      onSubmit={(values: FormData) => updateMutation.mutateAsync(values)}
      initialValues={pick(resolve.project, resolve.name)}
      subscription={{
        values: true,
        invalid: true,
        dirty: true,
        submitting: true,
      }}
    >
      {({ invalid, handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={getFieldTitle(resolve.name)}
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            {resolve.name === 'customer_name' ? (
              <FormGroup label={translate('Project owner')}>
                <Field
                  component={StringField as any}
                  name="customer_name"
                  disabled
                />
              </FormGroup>
            ) : resolve.name === 'name' ? (
              loadingProjects ? (
                <LoadingSpinner />
              ) : (
                <NameGroup customer={customer} />
              )
            ) : resolve.name === 'description' ? (
              <Field component={MarkdownEditor as any} name="description" />
            ) : resolve.name === 'is_industry' ? (
              <IndustryGroup />
            ) : resolve.name === 'start_date' ? (
              <StartDateGroup />
            ) : resolve.name === 'end_date' ? (
              <EndDateGroup />
            ) : resolve.name === 'oecd_fos_2007_code' ? (
              <OecdCodeGroup />
            ) : resolve.name === 'science_sub_domain' ? (
              <ScienceDomainGroup />
            ) : resolve.name === 'backend_id' ? (
              <FormGroup label={translate('Backend ID')}>
                <Field component={StringField as any} name="backend_id" />
              </FormGroup>
            ) : resolve.name === 'slug' ? (
              <FormGroup label={translate('Slug')}>
                <Field component={StringField as any} name="slug" />
              </FormGroup>
            ) : resolve.name === 'staff_notes' ? (
              <FormGroup label={translate('Staff notes')}>
                <Field component={MarkdownEditor as any} name="staff_notes" />
              </FormGroup>
            ) : resolve.name === 'kind' ? (
              <KindGroup />
            ) : resolve.name === 'max_service_accounts' ? (
              <FormGroup
                label={translate('Maximum number of service accounts')}
              >
                <Field
                  component={StringField as any}
                  name="max_service_accounts"
                  type="number"
                  min={0}
                />
              </FormGroup>
            ) : resolve.name === 'grace_period_days' ? (
              <FormGroup
                label={translate('Grace period (days)')}
                description={translate(
                  'Number of extra days after project end date before resources are terminated. Overrides customer-level setting.',
                )}
              >
                <Field
                  component={StringField as any}
                  name="grace_period_days"
                  type="number"
                  min={0}
                />
              </FormGroup>
            ) : null}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
