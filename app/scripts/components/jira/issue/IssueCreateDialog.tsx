import * as React from 'react';
import { InjectedFormProps } from 'redux-form';

import { StringField, TextField, SelectIconField, SelectAsyncField } from '@waldur/form-react';
import { optionRenderer } from '@waldur/form-react/optionRenderer';
import { TranslateProps } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { getResourceIcon } from '@waldur/resource/utils';

import { JiraProject, JiraIssue, Resource } from './types';

interface IssueCreateDialogProps extends TranslateProps, InjectedFormProps {
  project: JiraProject;
  loadProjectIssues: (query: string) => Promise<JiraIssue[]>;
  loadProjectResources: (query: string) => Promise<Resource[]>;
  createIssue: any;
  showParentField: boolean;
}

const issueOptionRenderer = (option: JiraIssue) => (
  <span>{option.key || 'N/A'}: {option.summary}</span>
);

const resourceOptionRenderer = optionRenderer({
  labelKey: 'name',
  tooltipKey: 'resource_type',
  iconKey: (resource: Resource) => getResourceIcon(resource.resource_type),
  imgStyle: {width: 19},
});

export const IssueCreateDialog = (props: IssueCreateDialogProps) => (
  <ActionDialog
    title={props.translate('Create request')}
    submitLabel={props.translate('Create request')}
    onSubmit={props.handleSubmit(props.createIssue)}
    submitting={props.submitting}
    error={props.error}>
    <SelectIconField
      name="type"
      label={props.translate('Request type')}
      options={props.project.issue_types}
      required={true}
      clearable={false}
      labelKey="name"
      valueKey="url"
      iconKey="icon_url"
    />
    {props.showParentField && (
      <SelectAsyncField
        name="parent"
        label={props.translate('Parent request')}
        required={true}
        labelKey="summary"
        valueKey="url"
        loadOptions={props.loadProjectIssues}
        optionRenderer={issueOptionRenderer}
        valueRenderer={issueOptionRenderer}
      />
    )}
    <StringField
      name="summary"
      label={props.translate('Summary')}
      required={true}
    />
    <TextField
      name="description"
      label={props.translate('Description')}
    />
    <SelectIconField
      name="priority"
      label={props.translate('Priority')}
      options={props.project.priorities}
      required={true}
      clearable={false}
      labelKey="name"
      valueKey="url"
      iconKey="icon_url"
      tooltipKey="description"
      imgStyle={{width: 19}}
    />
    <SelectAsyncField
      name="resource"
      label={props.translate('Related resource')}
      labelKey="name"
      valueKey="url"
      loadOptions={props.loadProjectResources}
      optionRenderer={resourceOptionRenderer}
      valueRenderer={resourceOptionRenderer}
    />
  </ActionDialog>
);
