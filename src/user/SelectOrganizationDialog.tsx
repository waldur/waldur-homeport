import * as React from 'react';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, SelectField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { redirectToMarketplaceCategory } from '@waldur/marketplace/landing/utils';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { SELECT_ORGANIZATION_FORM_ID } from '@waldur/user/constants';

const getOptions = (customerPermissions) =>
  customerPermissions.map((customerPermission) => ({
    label: customerPermission.customer_name,
    value: customerPermission.customer_uuid,
  }));

const SelectOrganizationDialogContainer = (props) => {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    setOptions(getOptions(props.resolve.customerPermissions));
  }, [props.resolve]);
  return (
    <form
      onSubmit={props.handleSubmit(props.onSubmit)}
      className="form-horizontal"
    >
      <ModalDialog
        title={translate('Select organization')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Continue')}
            />
          </>
        }
      >
        <FormContainer
          submitting={props.submitting}
          labelClass="col-sm-2"
          controlClass="col-sm-8"
          clearOnUnmount={false}
        >
          <SelectField
            name="organization"
            label={translate('Organization')}
            placeholder={translate('Select organization...')}
            required={true}
            options={options}
            simpleValue={true}
            validate={required}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

const mapDispatchToProps = (_dispatch, ownProps) => ({
  onSubmit: (formData) =>
    redirectToMarketplaceCategory(
      ownProps.resolve.router,
      formData.organization,
      ownProps.resolve.categoryUuid,
    ),
});

const connector = connect(mapDispatchToProps, null);

const enhance = compose(
  connector,
  reduxForm({
    form: SELECT_ORGANIZATION_FORM_ID,
  }),
);

export const SelectOrganizationDialog = enhance(
  SelectOrganizationDialogContainer,
);
