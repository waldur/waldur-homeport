import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Table from 'react-bootstrap/lib/Table';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import {
  Field,
  FieldArray,
  reduxForm,
  WrappedFieldArrayProps,
} from 'redux-form';

import { post } from '@waldur/core/api';
import { SubmitButton } from '@waldur/form';
import { renderValidationWrapper } from '@waldur/form/FieldValidationWrapper';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import { validatePrivateCIDR } from '../utils';

interface AllowedAddressPair {
  ip_address: string;
  mac_address: string;
}

interface OwnProps {
  resolve: {
    internalIp: {
      allowed_address_pairs: AllowedAddressPair[];
    };
    instance: {
      url: string;
    };
  };
}

interface FormData {
  pairs: AllowedAddressPair[];
}

const ValidatedInputField = renderValidationWrapper(InputField);

const PairRow = ({ pair, onRemove }) => (
  <tr>
    <td>
      <Field
        name={`${pair}.ip_address`}
        component={ValidatedInputField}
        validate={validatePrivateCIDR}
      />
    </td>
    <td>
      <Field name={`${pair}.mac_address`} component={ValidatedInputField} />
    </td>
    <td>
      <Button bsStyle="default" onClick={onRemove}>
        <i className="fa fa-trash" /> {translate('Remove')}
      </Button>
    </td>
  </tr>
);

const PairAddButton = ({ onClick }) => (
  <Button bsStyle="default" onClick={onClick}>
    <i className="fa fa-plus" /> {translate('Add pair')}
  </Button>
);

const PairsTable: React.FC<WrappedFieldArrayProps> = ({ fields }) =>
  fields.length > 0 ? (
    <>
      <Table
        responsive={true}
        bordered={true}
        striped={true}
        className="m-t-md"
      >
        <thead>
          <tr>
            <th>{translate('Internal network mask (CIDR)')}</th>
            <th>{translate('MAC address (optional)')}</th>
            <th>{translate('Actions')}</th>
          </tr>
        </thead>

        <tbody>
          {fields.map((pair, index) => (
            <PairRow
              key={pair}
              pair={pair}
              onRemove={() => fields.remove(index)}
            />
          ))}
        </tbody>
      </Table>
      <PairAddButton onClick={() => fields.push({})} />
    </>
  ) : (
    <PairAddButton onClick={() => fields.push({})} />
  );

const enhance = compose(
  connect<{}, {}, OwnProps>((_, ownProps) => ({
    initialValues: { pairs: ownProps.resolve.internalIp.allowed_address_pairs },
  })),
  reduxForm<FormData, OwnProps>({
    form: 'SetAllowedAddressPairsDialog',
  }),
);

export const SetAllowedAddressPairsDialog = enhance(
  ({ resolve, invalid, submitting, handleSubmit }) => {
    const dispatch = useDispatch();
    const setAllowedAddressPairs = async (formData: FormData) => {
      try {
        await post(
          `/openstacktenant-instances/${resolve.instance.uuid}/update_allowed_address_pairs/`,
          {
            subnet: resolve.internalIp.subnet,
            allowed_address_pairs: formData.pairs || [],
          },
        );
        dispatch(
          showSuccess(translate('Allowed address pairs update was scheduled.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showError(translate('Unable to update allowed address pairs.')),
        );
      }
    };

    return (
      <form
        onSubmit={handleSubmit(setAllowedAddressPairs)}
        className="form-horizontal"
      >
        <ModalDialog
          title={translate('Set allowed address pairs')}
          footer={
            <>
              <CloseDialogButton />
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Update')}
              />
            </>
          }
        >
          <FieldArray name="pairs" component={PairsTable} />
        </ModalDialog>
      </form>
    );
  },
);
