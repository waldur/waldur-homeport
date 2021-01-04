/** Difference between "SelectAffiliationDialog" and "SelectWorkspaceDialog" components:
 * "SelectAffiliationDialog" component is for selecting an organization or a project
 * which is directly connected to a user account.
 * While "SelectWorkspaceDialog" component is for selecting organization/project
 * that the user is authorized to see.
 */

import { triggerTransition } from '@uirouter/redux';
import { useEffect, useState } from 'react';
import { FormGroup, ToggleButton } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Field, formValueSelector, reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, SelectField, SubmitButton } from '@waldur/form';
import { ToggleButtonGroupInput } from '@waldur/form/ToggleButtonGroupInput';
import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RootState } from '@waldur/store/reducers';
import {
  ORGANIZATION_ROUTE,
  PROJECT_ROUTE,
  SELECT_AFFILIATION_FORM_ID,
} from '@waldur/user/constants';

const getOrganizationOptions = (customerPermissions) =>
  customerPermissions.map((customerPermission) => ({
    label: customerPermission.customer_name,
    value: customerPermission.customer_uuid,
  }));

const getProjectOptions = (projectPermissions) =>
  projectPermissions.map((projectPermission) => ({
    label: `${projectPermission.project_name} (${projectPermission.customer_name})`,
    value: projectPermission.project_uuid,
  }));

const SelectAffiliationDialogContainer = (props) => {
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
    <form
      onSubmit={props.handleSubmit(props.onSubmit)}
      className="form-horizontal"
    >
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
          <FormContainer
            submitting={props.submitting}
            labelClass="col-sm-2"
            controlClass="col-sm-8"
          >
            <FormGroup>
              <label className="control-label col-sm-2">
                {translate('Select affiliation')}
              </label>
              <div className="col-sm-8">
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
            </FormGroup>
            {props.affiliationValue === ORGANIZATION_ROUTE ? (
              <SelectField
                name="organization"
                label={translate('Organization')}
                placeholder={translate('Select organization...')}
                required={true}
                options={organizationOptions}
                simpleValue={true}
                validate={required}
                {...reactSelectMenuPortaling()}
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
                {...reactSelectMenuPortaling()}
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

const selector = formValueSelector(SELECT_AFFILIATION_FORM_ID);

const mapStateToProps = (state: RootState) => ({
  affiliationValue: selector(state, 'affiliation'),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit: (formData) =>
    dispatch(
      triggerTransition(formData.affiliation, {
        uuid:
          formData.affiliation === ORGANIZATION_ROUTE
            ? formData.organization
            : formData.project,
        category_uuid: ownProps.resolve.categoryUuid,
      }),
    ),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: SELECT_AFFILIATION_FORM_ID,
    initialValues: {
      affiliation: ORGANIZATION_ROUTE,
    },
  }),
);

export const SelectAffiliationDialog = enhance(
  SelectAffiliationDialogContainer,
);
