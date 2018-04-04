import * as React from 'react';
import Select from 'react-select';

import { QuotaList } from './types';

interface QuotaSelectorProps {
  quotas: QuotaList;
  value: string;
  handleChange(value): void;
}

export class QuotaSelector extends React.Component<QuotaSelectorProps> {
  render() {
    return (
      <div className="m-b-md">
        <div className="col-md-5 col-centered">
          <Select
            value={this.props.value}
            onChange={this.props.handleChange}
            options={this.props.quotas}
            labelKey="title"
            valueKey="key"
          />
        </div>
      </div>
    );
  }
}
