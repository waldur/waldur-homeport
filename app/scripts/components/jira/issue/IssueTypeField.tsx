import * as React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { JiraIssueType } from './types';

interface Props {
  issueTypes: JiraIssueType[];
}

export class IssueTypeField extends React.Component<Props> {
  state = {
    value: null,
  };

  render() {
    return (
      <Select
        name="issueType"
        options={this.props.issueTypes}
        value={this.state.value}
        onChange={this.setValue}
        optionRenderer={this.optionRenderer}
        valueRenderer={this.optionRenderer}
        clearable={false}
        valueKey="url"
        labelKey="name"
      />
    );
  }

  setValue = value => this.setState({value});

  optionRenderer = option => (
    <div>
      <img src={option.icon_url} style={{
        display: 'inline-block',
        marginRight: 10,
        position: 'relative',
        top: -2,
        verticalAlign: 'middle',
      }}/>
      {option.name}
    </div>
  )
}
