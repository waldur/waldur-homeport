import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import arrayMutators from 'final-form-arrays';
import React, { FC, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { Form, Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  AllowedAddressPairEntryRequest,
  OpenStackInstance,
  openstackPortsSetAllowedAddressPairs,
} from 'waldur-js-client';

import { StringField, FieldError, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';
import { CompactActionButton } from '@/table/CompactActionButton';

import { validatePrivateCIDR } from '../utils';

import { formatAddressList } from './utils';

interface OwnProps {
  resolve: {
    port: {
      uuid: string;
      allowed_address_pairs: AllowedAddressPairEntryRequest[];
    };
    instance: OpenStackInstance;
    refetch?: () => void;
  };
}

interface FormData {
  pairs: AllowedAddressPairEntryRequest[];
}

const PairRow = ({ pair, onRemove }) => (
  <tr>
    <td>
      <Field name={`${pair}.ip_address`} validate={validatePrivateCIDR}>
        {({ input, meta }) => (
          <>
            <StringField input={input} />
            <FieldError error={meta.touched && meta.error} />
          </>
        )}
      </Field>
    </td>
    <td>
      <Field name={`${pair}.mac_address`}>
        {({ input, meta }) => (
          <>
            <StringField input={input} />
            <FieldError error={meta.touched && meta.error} />
          </>
        )}
      </Field>
    </td>
    <td>
      <CompactActionButton
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

export const SetAllowedAddressPairsDialog: FC<OwnProps> = ({ resolve }) => {
  const mutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      openstackPortsSetAllowedAddressPairs({
        path: { uuid: resolve.port.uuid },
        body: {
          allowed_address_pairs: formData.pairs || [],
        },
      }),

    successMessage: translate('Allowed address pairs update was scheduled.'),
    errorMessage: translate('Unable to update allowed address pairs.'),
    refetch: resolve.refetch,
  });

  const setAllowedAddressPairs = async (formData: FormData) => {
    try {
      await mutation.mutateAsync(formData);
    } catch {
      // Error is handled by useManagedMutation
    }
  };

  const initialValues = useMemo(
    () => ({
      pairs: resolve.port.allowed_address_pairs,
    }),
    [resolve.port.allowed_address_pairs],
  );

  return (
    <Form<FormData>
      onSubmit={setAllowedAddressPairs}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, invalid, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate(
              'Set allowed address pairs ({instance} / {ipAddress})',
              {
                instance: resolve.instance.name,
                ipAddress: formatAddressList(resolve.port as any),
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
      )}
    />
  );
};
