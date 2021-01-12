import { FC, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FormSection, WrappedFieldArrayProps } from 'redux-form';

import { translate } from '@waldur/i18n';
import { SelectField } from '@waldur/openstack/openstack-instance/actions/update-floating-ips/SelectField';
import { RootState } from '@waldur/store/reducers';

import {
  BackupFormChoices,
  hasFreeSubnets,
  getFreeSubnets,
  getFreeFloatingIps,
  getAllNetworksSelector,
  getNetworkSelector,
  SKIP_FLOATING_IP_ASSIGNMENT,
} from './utils';

type NetworkChoices = Pick<BackupFormChoices, 'subnets' | 'floatingIps'>;

const AddButton = ({ onClick, disabled }) => (
  <Button bsStyle="default" onClick={onClick} disabled={disabled}>
    <i className="fa fa-plus"></i> {translate('Add')}
  </Button>
);

const DeleteButton = ({ onClick }) => (
  <Button bsStyle="default" title={translate('Delete')} onClick={onClick}>
    <i className="fa fa-trash-o"></i>
  </Button>
);

const NetworkRow: FC<NetworkChoices & { name: string; onDelete(): void }> = ({
  name,
  subnets,
  floatingIps,
  onDelete,
}) => {
  const network = useSelector((state: RootState) =>
    getNetworkSelector(name)(state),
  );
  const networks = useSelector(getAllNetworksSelector);
  const freeSubnets = useMemo(
    () => getFreeSubnets(subnets, networks, network),
    [subnets, networks, network],
  );
  const freeFloatingIps = useMemo(
    () => getFreeFloatingIps(floatingIps, networks, network),
    [floatingIps, networks, network],
  );
  return (
    <tr>
      <td className="p-l-n col-md-6">
        <SelectField name="subnet" options={freeSubnets} />
      </td>
      <td className="col-md-5">
        <SelectField
          options={freeFloatingIps}
          name="floating_ip"
          disabled={!network.subnet}
        />
      </td>
      <td className="p-r-n">
        <DeleteButton onClick={onDelete} />
      </td>
    </tr>
  );
};

export const NetworksList: FC<WrappedFieldArrayProps & NetworkChoices> = ({
  fields,
  subnets,
  floatingIps,
}) => {
  const networks = useSelector(getAllNetworksSelector);
  const addDisabled = useMemo(() => !hasFreeSubnets(subnets, networks), [
    subnets,
    networks,
  ]);
  return (
    <>
      <table className="table table-borderless m-b-xs">
        <tbody>
          {fields.map((field, index) => (
            <FormSection key={index} name={field}>
              <NetworkRow
                name={field}
                subnets={subnets}
                floatingIps={floatingIps}
                onDelete={() => fields.remove(index)}
              />
            </FormSection>
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
