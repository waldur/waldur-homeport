import * as React from 'react';
import { InjectedFormProps } from 'redux-form';

import { StringField, TextField, SelectIconField, SelectAsyncField } from '@waldur/form-react';
import { TranslateProps } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';

import { JiraProject, JiraIssue } from './types';

interface IssueCreateDialogProps extends TranslateProps, InjectedFormProps {
  project: JiraProject;
  loadProjectIssues: any;
  createIssue: any;
  isSubtask: boolean;
}

const issueOptionRenderer = (option: JiraIssue) => (
  <span>{option.key || 'N/A'}: {option.summary}</span>
);

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
    {props.isSubtask && (
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
  </ActionDialog>
);
