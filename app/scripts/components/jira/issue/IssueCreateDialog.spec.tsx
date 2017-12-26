import { ReactWrapper } from 'enzyme';
import * as React from 'react';

import { mountTestForm } from '@waldur/form-react/testUtils';

import { IssueCreateDialogContainer } from './IssueCreateContainer';

const renderDialog = ({ issueTypeName }) => {
  const project = {
    url: 'http://example.com/api/jira-projects/1/',
    issue_types: [
      {
        name: issueTypeName,
        url: 'http://example.com/api/jira-issue-types/1/',
        icon_url: 'http://example.com/api/jira-issue-types/1/icon/',
      },
    ],
  };
  const Component = () => <IssueCreateDialogContainer resolve={{project}}/>;
  return mountTestForm(Component);
};

const getLabels = (wrapper: ReactWrapper) => wrapper.find('label').map(node => node.text());

describe('IssueCreateDialog', () => {
  it('renders default fields for task', () => {
    const wrapper = renderDialog({issueTypeName: 'Task'});
    expect(getLabels(wrapper)).toEqual(['Request type *', 'Summary *', 'Description']);
  });

  it('renders parent field for sub-task', () => {
    const wrapper = renderDialog({issueTypeName: 'Sub-task'});
    expect(getLabels(wrapper)).toEqual(['Request type *', 'Parent request *', 'Summary *', 'Description']);
  });
});
