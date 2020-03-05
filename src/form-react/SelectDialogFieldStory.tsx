import * as React from 'react';

import { SelectDialogField } from '@waldur/form-react/SelectDialogField';
import { connectAngularComponent } from '@waldur/store/connect';

import { columns, choices, openstackTemplateFilters } from './storyFixtures';

class SelectDialogFieldStory extends React.Component {
  state = {
    selectedValue: null,
  };

  onSelectValue = selectedValue => {
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

export default connectAngularComponent(SelectDialogFieldStory);
