import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import Select, { Option, OptionValues } from 'react-select';

import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { internalIpFormatter } from '@waldur/openstack/openstack-instance/openstack-instance-config';
import { Subnet, FloatingIp } from '@waldur/openstack/openstack-instance/types';

interface NetworkItems {
  [index: number]: {
    subnet?: Option<OptionValues>,
    floatingIp?: Option<OptionValues>,
  };
}

interface OpenstackInstanceNetworksProps extends TranslateProps {
  input: {
    value: NetworkItems;
    onChange(value: NetworkItems): void;
  };
  subnets: Subnet[];
  floatingIps: FloatingIp[];
}

interface OpenstackInstanceNetworksState {
  items: Array<{[index: number]: number}>;
  currentIndex: number;
}

export default class OpenstackInstanceNetworks extends React.Component<OpenstackInstanceNetworksProps, OpenstackInstanceNetworksState> {
  state = {
    items: [],
    currentIndex: 0,
  };

  addItem = () => {
    this.setState({
      items: [...this.state.items, {index: this.state.currentIndex}],
    }, () => this.setState({currentIndex: this.state.currentIndex + 1}));
  }

  removeItem = (item, index) => {
    const itemIndex = this.state.items.indexOf(item);
    this.setState({items: [
      ...this.state.items.slice(0, itemIndex),
      ...this.state.items.slice(itemIndex + 1),
    ]});
    const {[index]: _, ...rest} = this.props.input.value;
    this.props.input.onChange(rest);
  }

  componentDidMount() {
    this.addItem();
  }

  onSubnetChange = (value, index) => {
    const combinedValue = {...this.props.input.value};
    const subnet = {
        ...value,
        clearableValue: false,
      };
    if (combinedValue[index] !== undefined) {
      combinedValue[index].subnet = subnet;
    } else {
      combinedValue[index] = {
        subnet,
      };
    }
    this.props.input.onChange(combinedValue);
  }

  onFloatingIpChange = (value, index) => {
    const combinedValue = {...this.props.input.value};
    combinedValue[index].floatingIp = value;
    this.props.input.onChange(combinedValue);
  }

  getAvailableNetworkItems = itemType => item => {
    const selectedItemUrls = [];
    Object.keys(this.props.input.value).map(key => {
      if (this.props.input.value[key][itemType]) {
        selectedItemUrls.push(this.props.input.value[key][itemType].value);
      }
    });
    return selectedItemUrls.indexOf(item.url) === -1;
  }

  getFreeSubnets = () =>
    this.props.subnets
      .filter(this.getAvailableNetworkItems('subnet'))
      .map(subnet => ({
        label: internalIpFormatter(subnet),
        value: subnet.url,
      }))

  getDefaultFloatingIpOptions = () => [
      {
        label: this.props.translate('Skip floating IP assignment'),
        value: 'false',
      },
      {
        label: this.props.translate('Auto-assign floating IP'),
        value: 'true',
      },
  ]

  getFreeFloatingIps = () =>
    [
      ...this.getDefaultFloatingIpOptions(),
      ...this.props.floatingIps
        .filter(this.getAvailableNetworkItems('floatingIp'))
        .map(floatingIp => ({
          label: floatingIp.address,
          value: floatingIp.url,
        })),
    ]

  getSelectValue = selectType => index => {
    if (this.props.input.value[index]) {
      return this.props.input.value[index][selectType];
    }
    return null;
  }

  hasFreeSubnets = () =>
    this.getFreeSubnets().length > 0

  disableFloatingIpSelect = item =>
    !this.props.input.value[item.index] || !this.props.input.value[item.index].subnet

  render() {
    const subnetOptions = this.getFreeSubnets();
    const floatingIpOptions = this.getFreeFloatingIps();
    return (
      <>
        <Table bsClass="table table-borderless m-b-xs">
          <tbody>
            {this.state.items.map(item => (
              <tr key={item.index}>
                <td className="p-l-n col-md-6">
                  <Select
                    name="subnets"
                    value={this.getSelectValue('subnet')(item.index)}
                    onChange={value => this.onSubnetChange(value, item.index)}
                    placeholder={this.props.translate('Select subnet')}
                    onBlur={() => {/* Noop */}}
                    options={subnetOptions}
                    clearable={false}
                  />
                </td>
                <td className="col-md-5">
                  <Select
                    name="floatingIps"
                    value={this.getSelectValue('floatingIp')(item.index)}
                    onChange={value => this.onFloatingIpChange(value, item.index)}
                    onBlur={() => {/* Noop */}}
                    options={floatingIpOptions}
                    disabled={this.disableFloatingIpSelect(item)}
                  />
                </td>
                <td className="p-r-n">
                  <Tooltip
                    id="item-remove"
                    label={this.props.translate('Delete')}>
                      <button
                        type="button"
                        className="btn btn-default"
                        onClick={() => this.removeItem(item, item.index)}
                      >
                        <i className="fa fa-trash-o"/>
                      </button>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <button
          type="button"
          className="btn btn-default"
          disabled={!this.hasFreeSubnets()}
          onClick={() => this.addItem()}>
            <i className="fa fa-plus"/>
            {' '}
            {this.props.translate('Add')}
        </button>
      </>
    );
  }
}

export const OpenstackInstanceNetworksContainer = withTranslation(OpenstackInstanceNetworks);
