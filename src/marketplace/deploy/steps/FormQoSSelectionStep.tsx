import classNames from 'classnames';
import { useEffect, useMemo } from 'react';
import { useForm, useFormState } from 'react-final-form';
import { Offering } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { Tip } from '@/core/Tooltip';
import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';

import { FormStepProps } from '../types';

/** QoS is mandatory when the partition restricts QoS but defines no default. */
export const isPartitionQosRequired = (
  offering: Pick<Offering, 'partitions'>,
  partitionName?: string,
): boolean => {
  const partition = (offering.partitions || []).find(
    (p) => p.partition_name === partitionName,
  );
  if (!partition?.qos_options?.length) {
    return false;
  }
  return !partition.qos_options.some((o) => o.is_default);
};

// Partition + QoS selection for SLURM offerings. The chosen partition name and
// QoS name are written to attributes.partition / attributes.qos, which the
// site agent reads to scope the SLURM association (Partition=, QosLevel=,
// DefaultQOS=). The QoS choices depend on the selected partition's allow-list.
export const FormQoSSelectionStep = (props: FormStepProps) => {
  const form = useForm();
  const { values } = useFormState({ subscription: { values: true } });

  const partitions = props.offering.partitions || [];
  const qosProfiles = props.offering.qos_profiles || [];

  const partitionOptions = useMemo(
    () =>
      partitions.map((p) => ({
        label: p.partition_name,
        value: p.partition_name,
      })),
    [partitions],
  );

  const selectedPartitionName = values?.attributes?.partition;
  const selectedPartition = useMemo(
    () => partitions.find((p) => p.partition_name === selectedPartitionName),
    [partitions, selectedPartitionName],
  );

  // Allowed QoS for the selected partition: its allow-list, or — when it has
  // none — all offering QoS (SLURM AllowQos=ALL).
  const allowedQos = useMemo(() => {
    if (selectedPartition?.qos_options?.length) {
      return selectedPartition.qos_options.map((o) => ({
        name: o.qos_name,
        is_default: o.is_default,
      }));
    }
    return qosProfiles.map((q) => ({ name: q.name, is_default: false }));
  }, [selectedPartition, qosProfiles]);

  const qosOptions = useMemo(
    () => allowedQos.map((q) => ({ label: q.name, value: q.name })),
    [allowedQos],
  );

  const defaultQos = allowedQos.find((q) => q.is_default)?.name;
  const qosRequired = isPartitionQosRequired(
    props.offering,
    selectedPartitionName,
  );

  // On partition change: preselect its default QoS, or drop a now-invalid one.
  useEffect(() => {
    const current = form.getState().values?.attributes?.qos;
    const allowedNames = allowedQos.map((q) => q.name);
    if (current && !allowedNames.includes(current)) {
      form.change('attributes.qos', defaultQos);
    } else if (!current && defaultQos) {
      form.change('attributes.qos', defaultQos);
    }
    // Intentionally keyed on partition only — re-sync when the user switches.
  }, [selectedPartitionName]);

  // Nothing to select — the step should not have been activated, but guard
  // defensively (the step is gated on qos_profiles, not partitions).
  if (!qosProfiles.length) {
    return null;
  }

  return (
    <Tip id={`tip-${props.id}`} label={props.disabledTooltip}>
      <AccordionCard
        title={props.title}
        id={props.id}
        className={classNames('step-card', props.disabled && 'step-disabled')}
        defaultOpen
      >
        {props.disabled && <div className="step-blocker" />}
        {partitions.length > 0 && (
          <SelectGroup
            name="attributes.partition"
            label={translate('Partition')}
            placeholder={translate('Select partition...')}
            options={partitionOptions}
            isClearable
            simpleValue
          />
        )}
        <SelectGroup
          name="attributes.qos"
          label={translate('Quality of service (QoS)')}
          placeholder={translate('Select QoS...')}
          options={qosOptions}
          isClearable
          simpleValue
          required={qosRequired}
          validate={qosRequired ? required : undefined}
        />
      </AccordionCard>
    </Tip>
  );
};
