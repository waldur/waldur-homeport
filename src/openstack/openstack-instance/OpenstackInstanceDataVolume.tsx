import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

interface OpenstackInstanceDataVolumeProps {
  input: {
    value: string;
    onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  };
  step?: number;
  min?: number;
  max?: number;
  units?: string;
  isActive: boolean;
  setActive(value: boolean): void;
}

export class OpenstackInstanceDataVolume extends React.Component<OpenstackInstanceDataVolumeProps> {
  toggleField = () => {
    this.props.input.onChange(undefined);
    this.props.setActive(!this.props.isActive);
  };

  componentDidMount() {
    if (this.props.min) {
      this.toggleField();
    }
  }

  render() {
    const props = this.props;
    return (
      <table className="table table-borderless mb-1">
        <tbody>
          {!this.props.isActive && (
            <tr>
              <td className="p-0">
                <Button onClick={this.toggleField}>
                  <i className="fa fa-plus" /> {translate('Add data volume')}
                </Button>
              </td>
            </tr>
          )}
          {this.props.isActive && (
            <tr>
              <td className="p-0">
                <label>{translate('Data volume size:')}</label>
              </td>
            </tr>
          )}
          {this.props.isActive && (
            <tr>
              <td className="p-0" style={{ width: 220 }}>
                <InputGroup style={{ maxWidth: 200 }}>
                  <Form.Control
                    {...props.input}
                    type="number"
                    style={{ zIndex: 'unset' }}
                    min={props.min}
                    max={props.max}
                    step={props.step}
                  />
                  {props.units && (
                    <InputGroup.Text>{props.units}</InputGroup.Text>
                  )}
                </InputGroup>
              </td>
              <td className="p-0">
                <Tip
                  id="data-volume-disable"
                  label={translate('Disable data volume')}
                >
                  <Button onClick={this.toggleField}>
                    <i className="fa fa-trash-o" />
                  </Button>
                </Tip>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}
