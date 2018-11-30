import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';
import Select from 'react-select';

import { TranslateProps } from '@waldur/i18n';
import { openSecurityGroupsDetailsDialog } from '@waldur/openstack/openstack-instance/store/actions';
import { SecurityGroup, SecurityGroupOption } from '@waldur/openstack/openstack-security-groups/types';

interface OpenstackInstanceSecurityGroupsProps extends TranslateProps {
  openSecurityGroupsDetailsDialog(securityGroups: SecurityGroup[]): void;
  input: {
    values: SecurityGroupOption[];
    onChange(values: SecurityGroupOption[]): void;
  };
  securityGroups: SecurityGroup[];
}

class OpenstackInstanceSecurityGroups extends React.Component<OpenstackInstanceSecurityGroupsProps> {
  openDetailsDialog = () => {
    const selectedSecurityGroupsUuids = this.props.input.values
      .map(selectedSecurityGroup => selectedSecurityGroup.uuid);
    const selectedSecurityGroups = this.props.securityGroups.filter(selectedSecurityGroup =>
      selectedSecurityGroupsUuids.indexOf(selectedSecurityGroup.uuid) !== -1
    );
    this.props.openSecurityGroupsDetailsDialog(selectedSecurityGroups);
  }

  componentDidMount() {
    const defaultSecurityGroup = this.props.securityGroups.find(securityGroup => securityGroup.name === 'default');
    if (defaultSecurityGroup) {
      this.props.input.onChange([
        {
          ...defaultSecurityGroup,
          clearableValue: false,
        },
      ]);
    }
  }

  render() {
    return (
      <Row>
        <Col md={9}>
          <Select
            name="security-group"
            value={this.props.input.values}
            options={this.props.securityGroups}
            labelKey="name"
            valueKey="uuid"
            onChange={this.props.input.onChange}
            onBlur={() => {/* Noop */}}
            multi={true}
            clearable={false}
          />
        </Col>
        <Col md={3}>
          <button
            className="btn btn-default"
            disabled={this.props.input.values.length === 0}
            onClick={this.openDetailsDialog}>
              <i className="fa fa-eye"/>
              {' '}
              {this.props.translate('Details')}
          </button>
        </Col>
      </Row>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  openSecurityGroupsDetailsDialog: securityGroups => dispatch(openSecurityGroupsDetailsDialog(securityGroups)),
});

export const OpenstackInstanceSecurityGroupsContainer = connect(undefined, mapDispatchToProps)(OpenstackInstanceSecurityGroups);
