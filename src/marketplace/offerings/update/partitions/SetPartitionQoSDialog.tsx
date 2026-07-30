import { ListChecksIcon } from '@phosphor-icons/react';
import { FC, useEffect, useMemo } from 'react';
import { Form, useForm, useFormState } from 'react-final-form';
import {
  marketplaceProviderOfferingsSetPartitionQos,
  NestedPartition,
} from 'waldur-js-client';

import { SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface SetPartitionQoSDialogProps {
  resolve: {
    partition: NestedPartition;
    offering: any;
    refetch: () => Promise<void>;
  };
}

interface FormData {
  allowed: string[];
  default_qos?: string;
}

/** Drop default_qos when it is no longer in the allow-list. */
const ClearStaleDefaultQoS: FC = () => {
  const form = useForm<FormData>();
  const { values } = useFormState<FormData>({ subscription: { values: true } });

  useEffect(() => {
    if (
      values.default_qos &&
      !(values.allowed || []).includes(values.default_qos)
    ) {
      form.change('default_qos', undefined);
    }
  }, [values.allowed, values.default_qos, form]);

  return null;
};

export const SetPartitionQoSDialog: FC<SetPartitionQoSDialogProps> = ({
  resolve,
}) => {
  const { partition, offering } = resolve;

  const qosOptions = useMemo(
    () =>
      (offering.qos_profiles || []).map((q) => ({
        label: q.name,
        value: q.uuid,
      })),
    [offering.qos_profiles],
  );

  const initialValues = useMemo<FormData>(
    () => ({
      allowed: (partition.qos_options || []).map((o) => o.qos),
      default_qos: (partition.qos_options || []).find((o) => o.is_default)?.qos,
    }),
    [partition.qos_options],
  );

  const saveMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsSetPartitionQos({
        path: { uuid: offering.uuid },
        body: {
          partition_uuid: partition.uuid,
          qos_options: (formData.allowed || []).map((uuid) => ({
            qos_uuid: uuid,
            is_default: uuid === formData.default_qos,
          })),
        },
      }),
    successMessage: translate('Partition QoS allow-list has been updated.'),
    errorMessage: translate('Unable to update partition QoS allow-list.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<FormData>
      onSubmit={(values) => saveMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, values }) => {
        const allowed = values.allowed || [];
        const defaultOptions = qosOptions.filter((o) =>
          allowed.includes(o.value),
        );
        return (
          <form onSubmit={handleSubmit}>
            <ClearStaleDefaultQoS />
            <ModalDialog
              title={translate('Manage QoS for partition {name}', {
                name: partition.partition_name,
              })}
              footer={
                <>
                  <CloseDialogButton className="w-125px" />
                  <SubmitButton
                    submitting={submitting}
                    label={translate('Save')}
                    className="btn btn-primary w-125px"
                  />
                </>
              }
              iconNode={<ListChecksIcon weight="bold" />}
              iconColor="success"
            >
              <p className="text-muted">
                {translate(
                  'Select which QoS profiles jobs may request in this partition. An empty list permits all of the offering QoS.',
                )}
              </p>
              <SelectGroup
                name="allowed"
                label={translate('Allowed QoS')}
                placeholder={translate('Select QoS profiles...')}
                options={qosOptions}
                isMulti
                isClearable
                simpleValue
              />
              <SelectGroup
                name="default_qos"
                label={translate('Default QoS')}
                placeholder={translate('Select default QoS...')}
                options={defaultOptions}
                isClearable
                simpleValue
              />
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
