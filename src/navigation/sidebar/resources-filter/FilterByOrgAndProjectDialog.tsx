import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';
import { Project } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { SIDEBAR_RESOURCES_FILTER_FORM } from '@/marketplace/constants';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@/marketplace/resources/list/ProjectFilter';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { Customer } from '@/workspace/types';

import { useOrganizationAndProjectFiltersForResources } from './utils';

interface FormData {
  organization?: Customer;
  project?: Project;
}

export const FilterByOrgAndProjectDialog = reduxForm<FormData>({
  form: SIDEBAR_RESOURCES_FILTER_FORM,
  destroyOnUnmount: true,
})((props) => {
  const dispatch = useDispatch<any>();

  const { closeDialog } = useModal();

  const { syncResourceFilters } =
    useOrganizationAndProjectFiltersForResources();

  const formValues = useSelector(
    getFormValues(SIDEBAR_RESOURCES_FILTER_FORM),
  ) as FormData;

  const apply = useCallback(
    (formData) => {
      if (formData) {
        syncResourceFilters(formData);
        closeDialog();
      }
    },
    [syncResourceFilters, closeDialog],
  );

  // Clear project filter if organization is cleared
  useEffect(() => {
    if (!formValues?.project) return;
    if (
      !formValues?.organization ||
      formValues.organization.uuid !== formValues.project.customer_uuid
    ) {
      dispatch(props.change('project', undefined));
    }
  }, [formValues, props.change]);

  return (
    <form onSubmit={props.handleSubmit(apply)}>
      <ModalDialog
        title={translate('Filter by organization/project')}
        subtitle={translate(
          'Filter results by chosen organization and project',
        )}
        footer={
          <>
            <CloseDialogButton className="flex-equal" />
            <SubmitButton
              submitting={false}
              className="flex-equal"
              label={translate('Apply')}
            />
          </>
        }
      >
        <div className="d-flex flex-column gap-7">
          <OrganizationAutocomplete />
          <ProjectFilter
            customer_uuid={formValues?.organization?.uuid}
            isDisabled={!formValues?.organization?.uuid}
          />
        </div>
      </ModalDialog>
    </form>
  );
});
