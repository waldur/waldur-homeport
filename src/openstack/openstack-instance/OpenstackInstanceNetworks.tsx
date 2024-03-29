import { Component } from 'react';
import { Button, Table } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { Subnet, FloatingIp } from '@waldur/openstack/openstack-instance/types';
import { formatSubnet } from '@waldur/openstack/openstack-instance/utils';

interface NetworkItem {
  subnet?;
  floatingIp;
}

interface OpenstackInstanceNetworksComponentProps {
  input: {
    value: NetworkItem[];
    onChange(value: NetworkItem[]): void;
  };
  subnets: Subnet[];
  floatingIps: FloatingIp[];
}

export const getDefaultFloatingIps = () => [
  {
    address: translate('Skip floating IP assignment'),
    url: 'false',
  },
  {
    address: translate('Auto-assign floating IP'),
    url: 'true',
  },
];

export class OpenstackInstanceNetworks extends Component<OpenstackInstanceNetworksComponentProps> {
  addItem = () => {
    if (this.hasFreeSubnets()) {
      if (this.props.input.value) {
        this.props.input.onChange([
          ...this.props.input.value,
          this.getDefaultValue(),
        ]);
      } else {
        this.props.input.onChange([this.getDefaultValue()]);
      }
    }
  };

  getDefaultValue = () => ({
    subnet: this.getFreeSubnets().length !== 0 ? this.getFreeSubnets()[0] : {},
    floatingIp:
      getDefaultFloatingIps().length !== 0 ? getDefaultFloatingIps()[0] : {},
  });

  removeItem = (index) => {
    const valueCopy = [
      ...this.props.input.value.slice(0, index),
      ...this.props.input.value.slice(index + 1),
    ];
    this.props.input.onChange(valueCopy);
  };

  componentDidMount() {
    if (!this.props.input.value) {
      this.addItem();
    }
  }

  onSubnetChange = (value, index) => {
    const valueCopy = [...this.props.input.value];
    valueCopy[index] = {
      ...valueCopy[index],
      subnet: value,
    };
    this.props.input.onChange(valueCopy);
  };

  onFloatingIpChange = (value, index) => {
    const valueCopy = [...this.props.input.value];
    valueCopy[index] = {
      ...valueCopy[index],
      floatingIp: value,
    };
    this.props.input.onChange(valueCopy);
  };

  getAvailableNetworkItems = (itemType) => (item) =>
    this.props.input.value
      ? this.props.input.value.filter((val) => val[itemType].uuid === item.uuid)
          .length === 0
      : true;

  getFreeSubnets = () =>
    this.props.subnets
      .filter(this.getAvailableNetworkItems('subnet'))
      .map((subnet) => ({
        ...subnet,
        label: formatSubnet(subnet),
      }));

  getFreeFloatingIps = () => [
    ...getDefaultFloatingIps(),
    ...this.props.floatingIps.filter(
      this.getAvailableNetworkItems('floatingIp'),
    ),
  ];

  getSelectValue = (selectType) => (index) => {
    if (this.props.input.value[index]) {
      return this.props.input.value[index][selectType];
    }
    return null;
  };

  hasFreeSubnets = () => this.getFreeSubnets().length !== 0;

  disableFloatingIpSelect = (index) =>
    this.props.input.value[index].subnet.uuid === undefined;

  render() {
    return (
      <>
        <Table bsPrefix="table table-borderless mb-1">
          <tbody>
            {this.props.input.value ? (
              this.props.input.value.map((_, index) => (
                <tr key={index}>
                  <td className="ps-0 col-md-6">
                    <Select
                      name="subnets"
                      value={this.getSelectValue('subnet')(index)}
                      onChange={(value) => this.onSubnetChange(value, index)}
                      placeholder={translate('Select subnet')}
                      onBlur={() => {
                        /* Noop */
                      }}
                      options={this.getFreeSubnets()}
                      isClearable={false}
                      getOptionValue={(option) => option.url}
                    />
                  </td>
                  <td className="col-md-5">
                    <Select
                      name="floatingIps"
                      value={this.getSelectValue('floatingIp')(index)}
                      onChange={(value) =>
                        this.onFloatingIpChange(value, index)
                      }
                      onBlur={() => {
                        /* Noop */
                      }}
                      options={this.getFreeFloatingIps()}
                      isDisabled={this.disableFloatingIpSelect(index)}
                      isClearable={false}
                      getOptionValue={(option) => option.url}
                      getOptionLabel={(option) => option.address}
                    />
                  </td>
                  <td className="pe-0">
                    <Tip id="item-remove" label={translate('Delete')}>
                      <Button onClick={() => this.removeItem(index)}>
                        <i className="fa fa-trash-o" />
                      </Button>
                    </Tip>
                  </td>
                </tr>
              ))
            ) : (
              <tr />
            )}
          </tbody>
        </Table>
        <Button
          disabled={!this.hasFreeSubnets()}
          onClick={() => this.addItem()}
        >
          <i className="fa fa-plus" /> {translate('Add')}
        </Button>
      </>
    );
  }
}
