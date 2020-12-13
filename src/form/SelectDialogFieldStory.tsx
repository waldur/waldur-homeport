import { Component } from 'react';

import { SelectDialogField } from '@waldur/form/SelectDialogField';

import { columns, choices, openstackTemplateFilters } from './storyFixtures';

export class SelectDialogFieldStory extends Component {
  state = {
    selectedValue: null,
  };

  onSelectValue = (selectedValue) => {
    this.setState({ selectedValue });
  };

  render() {
    return (
      <>
        <div>
          <strong>{`Selected value: ${this.state.selectedValue}`}</strong>
        </div>
        <SelectDialogField
          dialogTitle="Select Image"
          input={{
            value: this.state.selectedValue,
            onChange: this.onSelectValue,
            name: 'image',
          }}
          columns={columns}
          choices={choices}
          filterOptions={openstackTemplateFilters}
        />
      </>
    );
  }
}
