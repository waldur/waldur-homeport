import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import arrayMutators from 'final-form-arrays';
import React, { FC, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { Form, Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';
import {
  AllowedAddressPairEntryRequest,
  OpenStackAllowedAddressPair,
  OpenStackFixedIp,
  OpenStackInstance,
  openstackPortsSetAllowedAddressPairs,
} from 'waldur-js-client';

import { getUUID } from '@/core/utils';
import { StringField, FieldError, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';
import { CompactActionButton } from '@/table/CompactActionButton';

import { validatePrivateCIDR } from '../utils';

import { formatAddressList } from './utils';

export interface AllowedAddressPairsPort {
  url?: string;
  fixed_ips?: OpenStackFixedIp[];
  allowed_address_pairs?: OpenStackAllowedAddressPair[];
}

interface OwnProps {
  resolve: {
    port: AllowedAddressPairsPort;
    instance?: OpenStackInstance;
    refetch?: () => void;
  };
}

interface FormData {
  pairs: AllowedAddressPairEntryRequest[];
}

type PairsFields = FieldArrayRenderProps<
  AllowedAddressPairEntryRequest,
  HTMLElement
>['fields'];

const PairRow = ({
  pair,
  onRemove,
}: {
  pair: string;
  onRemove: () => void;
}) => (
  <tr>
    <td>
      <Field name={`${pair}.ip_address`} validate={validatePrivateCIDR}>
        {({ input, meta }) => (
          <>
            <StringField input={input} meta={meta} />
            <FieldError error={meta.touched && meta.error} />
          </>
        )}
      </Field>
    </td>
    <td>
      <Field name={`${pair}.mac_address`}>
        {({ input, meta }) => (
          <>
            <StringField input={input} meta={meta} />
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

const PairAddButton = ({ onClick }: { onClick: () => void }) => (
  <ActionButton
    action={onClick}
    title={translate('Add pair')}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
  />
);

const PairsTable: React.FC<{ fields: PairsFields }> = ({ fields }) =>
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
      <PairAddButton onClick={() => fields.push({ ip_address: '' })} />
    </>
  ) : (
    <PairAddButton onClick={() => fields.push({ ip_address: '' })} />
  );

export const SetAllowedAddressPairsDialog: FC<OwnProps> = ({ resolve }) => {
  const mutation = useManagedMutation<
    Awaited<ReturnType<typeof openstackPortsSetAllowedAddressPairs>>,
    unknown,
    FormData
  >({
    mutationFn: (formData) =>
      openstackPortsSetAllowedAddressPairs({
        path: { uuid: getUUID(resolve.port.url) },
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
      pairs: (resolve.port.allowed_address_pairs ?? []).map((pair) => ({
        ip_address: pair.ip_address ?? '',
        mac_address: pair.mac_address,
      })),
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
            title={
              resolve.instance
                ? translate(
                    'Set allowed address pairs ({instance} / {ipAddress})',
                    {
                      instance: resolve.instance.name,
                      ipAddress: formatAddressList(resolve.port),
                    },
                  )
                : translate('Set allowed address pairs ({ipAddress})', {
                    ipAddress: formatAddressList(resolve.port),
                  })
            }
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
