import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';

import { BaseButton, NativeSelect } from 'waldur-ui';

import { translate } from '@/i18n';

import {
  BackupFormChoices,
  getFreeFloatingIps,
  getFreeSubnets,
  hasFreeSubnets,
  SKIP_FLOATING_IP_ASSIGNMENT,
} from './utils';

type NetworkChoices = Pick<BackupFormChoices, 'subnets' | 'floatingIps'>;

const AddButton = ({ onClick, disabled }) => (
  <BaseButton
    onClick={onClick}
    disabled={disabled}
    disabledReason={translate('No available subnets')}
    label={translate('Add')}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
    size="lg"
  />
);

const DeleteButton = ({ onClick }) => (
  <BaseButton
    onClick={onClick}
    tooltip={translate('Delete')}
    iconNode={<TrashIcon weight="bold" />}
    variant="text-secondary"
    size="lg"
  />
);

const SubnetField = ({ name, subnets, networks, network }) => {
  const freeSubnets = useMemo(
    () => getFreeSubnets(subnets, networks, network),
    [subnets, networks, network],
  );

  return (
    <Field name={`${name}.subnet`}>
      {({ input }) => (
        <NativeSelect {...input} aria-label={translate('Subnet')}>
          {freeSubnets.map((option, index) => (
            <option value={option.value} key={index}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      )}
    </Field>
  );
};

const FloatingIpField = ({ name, floatingIps, networks, network }) => {
  const freeFloatingIps = useMemo(
    () => getFreeFloatingIps(floatingIps, networks, network),
    [floatingIps, networks, network],
  );

  return (
    <Field name={`${name}.floating_ip`}>
      {({ input }) => (
        <NativeSelect {...input} aria-label={translate('Floating IP')}>
          {freeFloatingIps.map((option, index) => (
            <option value={option.value} key={index}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      )}
    </Field>
  );
};

export const NetworksList: FC<NetworkChoices & { fields; values }> = ({
  fields,
  subnets,
  floatingIps,
  values,
}) => {
  const networks = values.networks;
  const addDisabled = useMemo(
    () => !hasFreeSubnets(subnets, networks),
    [subnets, networks],
  );
  return (
    <>
      <table className="table table-borderless mb-1">
        <tbody>
          {fields.map((name, index) => (
            <tr key={name}>
              <td className="ps-0 md:w-6/12">
                <SubnetField
                  name={name}
                  subnets={subnets}
                  networks={networks}
                  network={networks[index]}
                />
              </td>
              <td className="md:w-5/12">
                <FloatingIpField
                  name={name}
                  floatingIps={floatingIps}
                  networks={networks}
                  network={networks[index]}
                />
              </td>
              <td className="pe-0">
                <DeleteButton onClick={() => fields.remove(index)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AddButton
        onClick={() => {
          fields.push({ floating_ip: SKIP_FLOATING_IP_ASSIGNMENT });
        }}
        disabled={addDisabled}
      />
    </>
  );
};
