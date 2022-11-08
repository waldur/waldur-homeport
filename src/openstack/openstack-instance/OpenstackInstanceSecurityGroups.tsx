import { Component } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import {
  SecurityGroup,
  SecurityGroupOption,
} from '@waldur/openstack/openstack-security-groups/types';

const OpenStackSecurityGroupsDialog = lazyComponent(
  () => import('../openstack-security-groups/OpenStackSecurityGroupsDialog'),
  'OpenStackSecurityGroupsDialog',
);

const openSecurityGroupsDetailsDialog = (securityGroups: SecurityGroup[]) =>
  openModalDialog(OpenStackSecurityGroupsDialog, {
    resolve: { securityGroups },
    size: 'lg',
  });

interface OwnProps {
  input: {
    value: SecurityGroupOption[];
    onChange(value: SecurityGroupOption[]): void;
  };
  securityGroups: SecurityGroup[];
}

interface DispatchProps {
  openSecurityGroupsDetailsDialog(securityGroups: SecurityGroup[]): void;
}

class OpenstackInstanceSecurityGroupsComponent extends Component<
  OwnProps & DispatchProps
> {
  openDetailsDialog = (e) => {
    e.preventDefault();
    const selectedSecurityGroupsUuids = this.props.input.value.map(
      (selectedSecurityGroup) => selectedSecurityGroup.uuid,
    );
    const selectedSecurityGroups = this.props.securityGroups.filter(
      (selectedSecurityGroup) =>
        selectedSecurityGroupsUuids.indexOf(selectedSecurityGroup.uuid) !== -1,
    );
    this.props.openSecurityGroupsDetailsDialog(selectedSecurityGroups);
  };

  componentDidMount() {
    const defaultSecurityGroup = this.props.securityGroups.find(
      (securityGroup) => securityGroup.name === 'default',
    );
    if (defaultSecurityGroup && !this.props.input.value) {
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
            placeholder={translate('Select security groups...')}
            value={this.props.input.value}
            options={this.props.securityGroups}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            onChange={this.props.input.onChange}
            onBlur={() => {
              /* Noop */
            }}
            isMulti={true}
            isClearable={false}
          />
        </Col>
        <Col md={3}>
          <Button
            disabled={this.props.input.value.length === 0}
            onClick={this.openDetailsDialog}
          >
            <i className="fa fa-eye" /> {translate('Details')}
          </Button>
        </Col>
      </Row>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  openSecurityGroupsDetailsDialog: (securityGroups) =>
    dispatch(openSecurityGroupsDetailsDialog(securityGroups)),
});

const enhance = connect<{}, DispatchProps, OwnProps>(
  undefined,
  mapDispatchToProps,
);

export const OpenstackInstanceSecurityGroups = enhance(
  OpenstackInstanceSecurityGroupsComponent,
);
