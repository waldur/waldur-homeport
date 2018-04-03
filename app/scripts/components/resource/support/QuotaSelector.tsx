import * as React from 'react';
import { ButtonToolbar, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

import { QuotaList } from './types';

interface QuotaSelectorProps {
  quotas: QuotaList;
  value: string;
  handleChange(value): void;
}

export class QuotaSelector extends React.Component<QuotaSelectorProps> {
  render() {
    return (
      <ButtonToolbar>
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
      </ButtonToolbar>
    );
  }
}
