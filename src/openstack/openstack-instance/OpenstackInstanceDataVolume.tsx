import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { TranslateProps, withTranslation } from '@waldur/i18n';

interface IntegerFormField {
  input: {
    value: string;
    onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  };
  step?: number;
  min?: number;
  max?: number;
}

interface OpenstackInstanceDataVolumeProps extends TranslateProps {
  field: IntegerFormField;
  units?: string;
}

export class OpenstackInstanceDataVolumeComponent extends React.Component<OpenstackInstanceDataVolumeProps> {
  state = {
    active: false,
  };

  toggleField = () => {
    this.setState({active: !this.state.active});
  }

  componentDidMount() {
    if (this.props.field.min) {
      this.toggleField();
    }
  }

  render() {
    const props = this.props;
    const {input, ...rest} = this.props.field;
    return (
      <table className="table table-borderless m-b-xs">
        <tbody>
          {!this.state.active &&
            <tr>
              <td className="no-padding">
                <button type="button" className="btn btn-default" onClick={this.toggleField}>
                  <i className="fa fa-plus"/>
                  {' '}
                  {props.translate('Add data volume')}
                </button>
              </td>
            </tr>
          }
          {this.state.active &&
            <tr>
              <td className="no-padding">
                <label>{props.translate('Data volume size:')}</label>
              </td>
            </tr>
          }
          {this.state.active &&
            <tr>
              <td className="no-padding" style={{width: 220}}>
                <div className="input-group" style={{maxWidth: 200}}>
                  <input
                    {...props.field.input}
                    type="number"
                    className="form-control"
                    {...rest}
                  />
                  {props.units && (
                    <span className="input-group-addon">
                      {props.units}
                    </span>
                  )}
                </div>
              </td>
              <td className="no-padding">
                <Tooltip
                  id="data-volume-disable"
                  label={props.translate('Disable data volume')}>
                    <button type="button" className="btn btn-default" onClick={this.toggleField}>
                      <i className="fa fa-trash-o"/>
                    </button>
                </Tooltip>
              </td>
            </tr>
          }
        </tbody>
      </table>
    );
  }
}

export const OpenstackInstanceDataVolume = withTranslation(OpenstackInstanceDataVolumeComponent);
