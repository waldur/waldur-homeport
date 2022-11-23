import { triggerTransition } from '@uirouter/redux';
import { FC, useEffect, useState } from 'react';
import { Form, ToggleButton } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';
import { compose } from 'redux';
import {
  Field,
  formValueSelector,
  InjectedFormProps,
  reduxForm,
} from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, SelectField, SubmitButton } from '@waldur/form';
import { ToggleButtonGroupInput } from '@waldur/form/ToggleButtonGroupInput';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RootState } from '@waldur/store/reducers';
import {
  ORGANIZATION_ROUTE,
  PROJECT_ROUTE,
  SELECT_AFFILIATION_FORM_ID,
} from '@waldur/user/constants';
import { CustomerPermission, ProjectPermission } from '@waldur/workspace/types';

interface OwnProps {
  resolve: {
    customerPermissions: CustomerPermission[];
    projectPermissions: ProjectPermission[];
    categoryUuid: string;
  };
}

interface FormData {
  affiliation: string;
  organization: string;
  project: string;
}

const selector = formValueSelector(SELECT_AFFILIATION_FORM_ID);

const mapStateToProps = (state: RootState) => ({
  affiliationValue: selector(state, 'affiliation'),
});

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  onSubmit: (formData: FormData) => {
    dispatch(
      triggerTransition(formData.affiliation, {
        uuid:
          formData.affiliation === ORGANIZATION_ROUTE
            ? formData.organization
            : formData.project,
        category_uuid: ownProps.resolve.categoryUuid,
      }),
    );
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const formConnector = reduxForm<FormData, PropsFromRedux>({
  form: SELECT_AFFILIATION_FORM_ID,
  initialValues: {
    affiliation: ORGANIZATION_ROUTE,
  },
});

const enhance = compose(connector, formConnector);

const getUniqueCustomers = (customerPermissions: CustomerPermission[]) => {
  const seen = {};
  return customerPermissions.filter(({ customer_uuid }) => {
    if (seen[customer_uuid]) {
      return false;
    } else {
      seen[customer_uuid] = true;
      return true;
    }
  });
};

const getUniqueProjects = (projectPermissions: ProjectPermission[]) => {
  const seen = {};
  return projectPermissions.filter(({ project_uuid }) => {
    if (seen[project_uuid]) {
      return false;
    } else {
      seen[project_uuid] = true;
      return true;
    }
  });
};

const getOrganizationOptions = (customerPermissions: CustomerPermission[]) =>
  getUniqueCustomers(customerPermissions).map((customerPermission) => ({
    label: customerPermission.customer_name,
    value: customerPermission.customer_uuid,
  }));

const getProjectOptions = (projectPermissions: ProjectPermission[]) =>
  getUniqueProjects(projectPermissions).map((projectPermission) => ({
    label: `${projectPermission.project_name} (${projectPermission.customer_name})`,
    value: projectPermission.project_uuid,
  }));

const SelectAffiliationDialogContainer: FC<
  InjectedFormProps<FormData> & PropsFromRedux & OwnProps
> = (props) => {
  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [affiliationExist, setAffiliationExist] = useState<boolean>(true);
  useEffect(() => {
    setOrganizationOptions(
      getOrganizationOptions(props.resolve.customerPermissions),
    );
    setProjectOptions(getProjectOptions(props.resolve.projectPermissions));
    if (
      !props.resolve.customerPermissions.length &&
      !props.resolve.projectPermissions.length
    ) {
      setAffiliationExist(false);
    }
  }, [props.resolve]);
  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <ModalDialog
        title={translate('Select affiliation')}
        footer={
          <>
            <CloseDialogButton />
            {affiliationExist && (
              <SubmitButton
                disabled={props.invalid}
                submitting={props.submitting}
                label={translate('Continue')}
              />
            )}
          </>
        }
      >
        {affiliationExist ? (
          <FormContainer submitting={props.submitting}>
            <Form.Group>
              <Form.Label>{translate('Select affiliation')}</Form.Label>
              <div>
                <Field
                  name="affiliation"
                  component={ToggleButtonGroupInput}
                  type="radio"
                  defaultValue={ORGANIZATION_ROUTE}
                >
                  <ToggleButton value={ORGANIZATION_ROUTE}>
                    {translate('Organization')}
                  </ToggleButton>
                  <ToggleButton value={PROJECT_ROUTE}>
                    {translate('Project')}
                  </ToggleButton>
                </Field>
              </div>
            </Form.Group>
            {props.affiliationValue === ORGANIZATION_ROUTE ? (
              <SelectField
                name="organization"
                label={translate('Organization')}
                placeholder={translate('Select organization...')}
                required={true}
                options={organizationOptions}
                simpleValue={true}
                validate={required}
              />
            ) : (
              <SelectField
                name="project"
                label={translate('Project')}
                placeholder={translate('Select project...')}
                required={true}
                options={projectOptions}
                simpleValue={true}
                validate={required}
              />
            )}
          </FormContainer>
        ) : (
          <p>
            {translate(
              'Marketplace services can only be provisioned for a certain affiliation. You currently do not have any organizations or projects connected with your account.',
            )}
          </p>
        )}
      </ModalDialog>
    </form>
  );
};

export const SelectAffiliationDialog = enhance(
  SelectAffiliationDialogContainer,
);
