import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { translate } from '@waldur/i18n';

import {
  BackupFormChoices,
  getFreeFloatingIps,
  getFreeSubnets,
  hasFreeSubnets,
  SKIP_FLOATING_IP_ASSIGNMENT,
} from './utils';

type NetworkChoices = Pick<BackupFormChoices, 'subnets' | 'floatingIps'>;

const AddButton = ({ onClick, disabled }) => (
  <Button variant="default" onClick={onClick} disabled={disabled}>
    <span className="svg-icon svg-icon-2">
      <PlusIcon weight="bold" />
    </span>{' '}
    {translate('Add')}
  </Button>
);

const DeleteButton = ({ onClick }) => (
  <Button variant="default" title={translate('Delete')} onClick={onClick}>
    <span className="svg-icon svg-icon-2">
      <TrashIcon />
    </span>
  </Button>
);

const SubnetField = ({ name, subnets, networks, network }) => {
  const freeSubnets = useMemo(
    () => getFreeSubnets(subnets, networks, network),
    [subnets, networks, network],
  );

  return (
    <Field name={`${name}.subnet`} component="select" className="form-control">
      {freeSubnets.map((option, index) => (
        <option value={option.value} key={index}>
          {option.label}
        </option>
      ))}
    </Field>
  );
};

const FloatingIpField = ({ name, floatingIps, networks, network }) => {
  const freeFloatingIps = useMemo(
    () => getFreeFloatingIps(floatingIps, networks, network),
    [floatingIps, networks, network],
  );

  return (
    <Field
      name={`${name}.floating_ip`}
      component="select"
      className="form-control"
    >
      {freeFloatingIps.map((option, index) => (
        <option value={option.value} key={index}>
          {option.label}
        </option>
      ))}
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
              <td className="ps-0 col-md-6">
                <SubnetField
                  name={name}
                  subnets={subnets}
                  networks={networks}
                  network={networks[index]}
                />
              </td>
              <td className="col-md-5">
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
