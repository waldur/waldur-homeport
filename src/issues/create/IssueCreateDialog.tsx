import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { formValueSelector, change } from 'redux-form';

import { translate } from '@waldur/i18n';
import { getTemplates, IssueTemplate } from '@waldur/issues/api';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { getUser } from '@waldur/workspace/selectors';

import { getShowAllTypes, getIssueTypes } from '../types/utils';

import { ISSUE_CREATION_FORM_ID } from './constants';
import { IssueCreateForm } from './IssueCreateForm';
import {
  IssueOptions,
  IssueTypeOption,
  CreateIssueProps,
  IssueRequestPayload,
  IssueFormData,
} from './types';
import { sendIssueCreateRequest } from './utils';

interface CreateIssueDialogProps {
  resolve: {
    issue: CreateIssueProps;
    options: IssueOptions;
  };
}

const getDefaultOptions = (): IssueOptions => ({
  title: translate('Create request'),
  hideTitle: false,
  descriptionLabel: translate('Request description'),
  descriptionPlaceholder: translate('Request description'),
  summaryLabel: translate('Title'),
  summaryPlaceholder: translate('Request title'),
  submitTitle: translate('Create'),
});

const selector = formValueSelector(ISSUE_CREATION_FORM_ID);

const createIssue = async (
  formData: IssueFormData,
  issue: CreateIssueProps,
  dispatch,
) => {
  const description = issue.additionalDetails
    ? `${formData.description}. \n\nRequest details: ${issue.additionalDetails}`
    : formData.description;

  const payload: IssueRequestPayload = {
    type: formData.type.id,
    summary: formData.summary,
    description,
    is_reported_manually: true,
  };
  if (issue.customer) {
    payload.customer = issue.customer.url;
  }
  if (issue.project) {
    payload.project = issue.project.url;
  }
  if (issue.resource) {
    payload.resource = issue.resource.url;
  }
  if (formData.issueTemplate) {
    payload.template = formData.issueTemplate.url;
  }
  await sendIssueCreateRequest(payload, dispatch, formData.files);
};

export const IssueCreateDialog = ({ resolve }: CreateIssueDialogProps) => {
  const options = React.useMemo(
    () => ({ ...getDefaultOptions(), ...resolve.options }),
    [resolve.options],
  );
  const user = useSelector(getUser);
  const showAllTypes = getShowAllTypes(user);
  const defaultType = showAllTypes
    ? ISSUE_IDS.CHANGE_REQUEST
    : ISSUE_IDS.INFORMATIONAL;
  const issueTypes = getIssueTypes(showAllTypes);
  const defaultTypeOption = resolve.issue.type
    ? issueTypes.find(t => t.id === resolve.issue.type)
    : issueTypes.find(t => t.id === defaultType);
  const dispatch = useDispatch();

  const templateState = useAsync(getTemplates);

  const onCreateIssue = React.useCallback(
    formData => createIssue(formData, resolve.issue, dispatch),
    [resolve.issue, dispatch],
  );

  const issueType = useSelector<any, IssueTypeOption>(state =>
    selector(state, 'type'),
  );
  const issueTemplate = useSelector<any, IssueTemplate>(state =>
    selector(state, 'template'),
  );

  const filteredTemplates = React.useMemo(
    () =>
      templateState.value && issueType
        ? templateState.value.filter(
            option => ISSUE_IDS[option.issue_type] === issueType.id,
          )
        : [],
    [templateState.value, issueType],
  );

  React.useEffect(() => {
    if (issueTemplate) {
      dispatch(change(ISSUE_CREATION_FORM_ID, 'summary', issueTemplate.name));
      dispatch(
        change(
          ISSUE_CREATION_FORM_ID,
          'description',
          issueTemplate.description,
        ),
      );
    }
  }, [issueTemplate, dispatch]);

  React.useEffect(() => {
    if (filteredTemplates.length == 0 && issueTemplate) {
      dispatch(change(ISSUE_CREATION_FORM_ID, 'template', undefined));
      dispatch(change(ISSUE_CREATION_FORM_ID, 'summary', ''));
      dispatch(change(ISSUE_CREATION_FORM_ID, 'description', ''));
    }
  }, [filteredTemplates, issueTemplate, dispatch]);

  return (
    <IssueCreateForm
      issue={resolve.issue}
      options={options}
      issueTypes={issueTypes}
      templateState={templateState}
      filteredTemplates={filteredTemplates}
      attachments={issueTemplate ? issueTemplate.attachments : []}
      onCreateIssue={onCreateIssue}
      initialValues={{
        type: defaultTypeOption,
      }}
    />
  );
};
