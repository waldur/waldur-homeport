import * as React from 'react';
import * as ToggleButton from 'react-bootstrap/lib/ToggleButton';
import * as ToggleButtonGroup from 'react-bootstrap/lib/ToggleButtonGroup';

import { QuotaList } from './types';

interface QuotaSelectorProps {
  quotas: QuotaList;
  value: string;
  handleChange(value): void;
}

export class QuotaSelector extends React.Component<QuotaSelectorProps> {
  render() {
    return (
      <div className="text-center m-b-md">
        <ToggleButtonGroup
          type="radio"
          name="options"
          value={this.props.value}
          onChange={this.props.handleChange}
        >
          {this.props.quotas.map((quota, index) => (
            <ToggleButton key={index} value={quota.key}>{quota.title}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
    );
  }
}
