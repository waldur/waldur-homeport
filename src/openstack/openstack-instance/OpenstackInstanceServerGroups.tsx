import { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import Select from 'react-select';

import { translate } from '@waldur/i18n';
import {
  ServerGroup,
  ServerGroupOption,
} from '@waldur/openstack/openstack-server-groups/types';

interface OpenstackInstanceServerGroupsComponentProps {
  input: {
    value: ServerGroupOption[];
    onChange(value: ServerGroupOption[]): void;
  };
  serverGroups: ServerGroup[];
}

export class OpenstackInstanceServerGroups extends Component<OpenstackInstanceServerGroupsComponentProps> {
  render() {
    return (
      <Row>
        <Col md={9}>
          <Select
            name="server-group"
            placeholder={translate('Select a server group...')}
            value={this.props.input.value}
            options={this.props.serverGroups}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            onChange={this.props.input.onChange}
            onBlur={() => {
              /* Noop */
            }}
            isMulti={false}
            isClearable={false}
          />
        </Col>
      </Row>
    );
  }
}
