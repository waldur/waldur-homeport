import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
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

export class OpenstackInstanceDataVolume extends React.Component<
  OpenstackInstanceDataVolumeProps
> {
  toggleField = () => {
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
      <table className="table table-borderless m-b-xs">
        <tbody>
          {!this.props.isActive && (
            <tr>
              <td className="no-padding">
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={this.toggleField}
                >
                  <i className="fa fa-plus" /> {translate('Add data volume')}
                </button>
              </td>
            </tr>
          )}
          {this.props.isActive && (
            <tr>
              <td className="no-padding">
                <label>{translate('Data volume size:')}</label>
              </td>
            </tr>
          )}
          {this.props.isActive && (
            <tr>
              <td className="no-padding" style={{ width: 220 }}>
                <div className="input-group" style={{ maxWidth: 200 }}>
                  <input
                    {...props.input}
                    type="number"
                    className="form-control"
                    min={props.min}
                    max={props.max}
                    step={props.step}
                  />
                  {props.units && (
                    <span className="input-group-addon">{props.units}</span>
                  )}
                </div>
              </td>
              <td className="no-padding">
                <Tooltip
                  id="data-volume-disable"
                  label={translate('Disable data volume')}
                >
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={this.toggleField}
                  >
                    <i className="fa fa-trash-o" />
                  </button>
                </Tooltip>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}
