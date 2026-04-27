import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import { Table } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { Field, FieldArray, reduxForm } from 'redux-form';
import {
  OpenStackAllowedAddressPairRequest,
  OpenStackInstance,
  openstackInstancesUpdateAllowedAddressPairs,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { renderValidationWrapper } from '@/form/FieldValidationWrapper';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';

import { validatePrivateCIDR } from '../utils';

import { formatAddressList } from './utils';

interface OwnProps {
  resolve: {
    port: {
      allowed_address_pairs: OpenStackAllowedAddressPairRequest[];
    };
    instance: OpenStackInstance;
  };
}

interface FormData {
  pairs: OpenStackAllowedAddressPairRequest[];
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
      <ActionButton
        action={onRemove}
        title={translate('Remove')}
        iconNode={<TrashIcon weight="bold" />}
        variant="text-secondary"
      />
    </td>
  </tr>
);

const PairAddButton = ({ onClick }) => (
  <ActionButton
    action={onClick}
    title={translate('Add pair')}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
  />
);

const PairsTable: React.FC<any> = ({ fields }) =>
  fields.length > 0 ? (
    <>
      <Table responsive={true} bordered={true} striped={true} className="mt-3">
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
    initialValues: { pairs: ownProps.resolve.port.allowed_address_pairs },
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
        await openstackInstancesUpdateAllowedAddressPairs({
          path: { uuid: resolve.instance.uuid },
          body: {
            subnet: resolve.port.subnet,
            allowed_address_pairs: formData.pairs || [],
          },
        });
        dispatch(
          showSuccess(translate('Allowed address pairs update was scheduled.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to update allowed address pairs.'),
          ),
        );
      }
    };

    return (
      <form onSubmit={handleSubmit(setAllowedAddressPairs)}>
        <ModalDialog
          title={translate(
            'Set allowed address pairs ({instance} / {ipAddress})',
            {
              instance: resolve.instance.name,
              ipAddress: formatAddressList(resolve.port),
            },
          )}
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
