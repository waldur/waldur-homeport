import {
  ControlLabel,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import { AsyncState } from 'react-use/lib/useAsync';
import { compose } from 'redux';
import { Field, formValueSelector, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import {
  ISSUE_QUICK_CREATE_FORM_ID,
  ProjectGroup,
  ResourceGroup,
} from '@waldur/issues/create/IssueQuickCreate';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { RootState } from '@waldur/store/reducers';
import { getCustomer } from '@waldur/workspace/selectors';

import { IssueTemplate, IssueTemplateAttachment } from '../api';

import { AttachmentsList } from './AttachmentsList';
import { ISSUE_CREATION_FORM_ID } from './constants';
import { FileField } from './FileField';
import { IssueHeader } from './IssueHeader';
import { SelectField } from './SelectField';
import { TypeField } from './TypeField';
import { IssueFormData, CreateIssueProps, IssueOptions } from './types';

interface OwnProps {
  issue: CreateIssueProps;
  issueTypes: any;
  options: IssueOptions;
  onCreateIssue(formData: IssueFormData): void;
  templateState: AsyncState<IssueTemplate[]>;
  filteredTemplates: IssueTemplate[];
  attachments: IssueTemplateAttachment[];
  initialValues: any;
}

export const issueCreateProjectSelector = (state: RootState) =>
  formValueSelector(ISSUE_CREATION_FORM_ID)(state, 'project');

const mapStateToProps = (_, ownProps: OwnProps) => {
  if (ownProps.issue.description) {
    return {
      initialValues: {
        description: ownProps.issue.description,
        type: ownProps.issue.type,
      },
    };
  }
  return {};
};

const enhance = compose(
  connect<{}, {}, OwnProps>(mapStateToProps),
  reduxForm<IssueFormData, OwnProps>({
    form: ISSUE_CREATION_FORM_ID,
  }),
);

export const IssueCreateForm = enhance(
  ({
    issue,
    issueTypes,
    options,
    onCreateIssue,
    templateState,
    filteredTemplates,
    attachments,
    handleSubmit,
    submitting,
  }) => (
    <form onSubmit={handleSubmit(onCreateIssue)}>
      <ModalHeader>
        <ModalTitle>{options.title}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {templateState.loading ? (
          <LoadingSpinner />
        ) : templateState.error ? (
          <>{translate('Unable to load data.')}</>
        ) : (
          <>
            <IssueHeader issue={issue} />
            {!issue.type && (
              <FormGroup>
                <ControlLabel>{translate('Request type')}</ControlLabel>
                <TypeField issueTypes={issueTypes} isDisabled={submitting} />
              </FormGroup>
            )}
            {filteredTemplates.length > 0 && (
              <FormGroup>
                <ControlLabel>{translate('Template')}</ControlLabel>
                <Field
                  name="template"
                  component={SelectField}
                  placeholder={translate('Select issue template...')}
                  options={filteredTemplates}
                  isDisabled={submitting}
                  getOptionValue={(option) => option.uuid}
                  getOptionLabel={(option) => option.name}
                  isClearable={true}
                />
              </FormGroup>
            )}
            {!options.hideTitle && (
              <FormGroup>
                <ControlLabel>{options.summaryLabel}</ControlLabel>
                <Field
                  name="summary"
                  component={InputField}
                  type="text"
                  placeholder={options.summaryPlaceholder}
                  required={true}
                  disabled={submitting}
                />
              </FormGroup>
            )}
            <FormGroup>
              <ControlLabel>{options.descriptionLabel}</ControlLabel>
              <Field
                name="description"
                component={InputField}
                componentClass="textarea"
                className="h-150"
                placeholder={options.descriptionPlaceholder}
                required={true}
                disabled={submitting}
              />
            </FormGroup>
            <ProjectGroup
              disabled={submitting}
              customer={useSelector(getCustomer)}
              formId={ISSUE_QUICK_CREATE_FORM_ID}
            />
            <ResourceGroup
              disabled={submitting}
              project={useSelector(issueCreateProjectSelector)}
              formId={ISSUE_QUICK_CREATE_FORM_ID}
            />
            {attachments.length > 0 && (
              <FormGroup>
                <ControlLabel>{translate('Template files')}</ControlLabel>
                <AttachmentsList attachments={attachments} />
              </FormGroup>
            )}
            <FormGroup>
              <ControlLabel>{translate('Attachments')}</ControlLabel>
              <Field name="files" component={FileField} disabled={submitting} />
            </FormGroup>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <SubmitButton
          block={false}
          submitting={submitting}
          label={options.submitTitle}
        />
        <CloseDialogButton />
      </ModalFooter>
    </form>
  ),
);
