import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { formValueSelector, change } from 'redux-form';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getTemplates, IssueTemplate } from '@waldur/issues/api';
import { ISSUE_IDS, ISSUE_TYPE_CHOICES } from '@waldur/issues/types/constants';
import { getUser } from '@waldur/workspace/selectors';

import { FORM_ID } from './constants';
import { IssueCreateForm } from './IssueCreateForm';
import { IssueOptions, CreateIssueDialogProps, IssueTypeOption } from './types';
import { createIssue } from './utils';

const getDefaultOptions = (): IssueOptions => ({
  title: translate('Create request'),
  hideTitle: false,
  descriptionLabel: translate('Request description'),
  descriptionPlaceholder: translate('Request description'),
  summaryLabel: translate('Title'),
  summaryPlaceholder: translate('Request title'),
  submitTitle: translate('Create'),
});

const selector = formValueSelector(FORM_ID);

export const IssueCreateDialog = ({ resolve }: CreateIssueDialogProps) => {
  const options = React.useMemo(
    () => ({ ...getDefaultOptions(), ...resolve.options }),
    [resolve.options],
  );
  const user = useSelector(getUser);
  const showAllTypes =
    !ENV.concealChangeRequest || user.is_staff || user.is_support;
  const defaultType = showAllTypes
    ? ISSUE_IDS.CHANGE_REQUEST
    : ISSUE_IDS.INFORMATIONAL;
  const issueTypes = showAllTypes
    ? ISSUE_TYPE_CHOICES
    : ISSUE_TYPE_CHOICES.filter(x => x.id !== ISSUE_IDS.CHANGE_REQUEST);
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
      dispatch(change(FORM_ID, 'summary', issueTemplate.name));
      dispatch(change(FORM_ID, 'description', issueTemplate.description));
    }
  }, [issueTemplate, dispatch]);

  React.useEffect(() => {
    if (filteredTemplates.length == 0 && issueTemplate) {
      dispatch(change(FORM_ID, 'template', undefined));
      dispatch(change(FORM_ID, 'summary', ''));
      dispatch(change(FORM_ID, 'description', ''));
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
