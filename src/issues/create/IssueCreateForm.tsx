import { Form, Modal } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import { AsyncState } from 'react-use/lib/useAsync';
import { compose } from 'redux';
import { Field, formValueSelector, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { ENV } from '@waldur/configs/default';
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
  hideProjectAndResourceFields?: boolean;
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
    hideProjectAndResourceFields,
    handleSubmit,
    submitting,
  }) => (
    <form onSubmit={handleSubmit(onCreateIssue)}>
      <Modal.Header>
        <Modal.Title>{options.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7">
        {templateState.loading ? (
          <LoadingSpinner />
        ) : templateState.error ? (
          <>{translate('Unable to load data.')}</>
        ) : (
          <>
            <IssueHeader issue={issue} />
            {!ENV.plugins.WALDUR_SUPPORT?.DISPLAY_REQUEST_TYPE && (
              <>
                {!issue.type && (
                  <Form.Group className="mb-5">
                    <Form.Label>{translate('Request type')}</Form.Label>
                    <TypeField
                      issueTypes={issueTypes}
                      isDisabled={submitting}
                    />
                  </Form.Group>
                )}
              </>
            )}
            {filteredTemplates.length > 0 && (
              <Form.Group className="mb-5">
                <Form.Label>{translate('Template')}</Form.Label>
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
              </Form.Group>
            )}
            {!options.hideTitle && (
              <Form.Group className="mb-5">
                <Form.Label>{options.summaryLabel}</Form.Label>
                <Field
                  name="summary"
                  component={InputField}
                  type="text"
                  placeholder={options.summaryPlaceholder}
                  required={true}
                  disabled={submitting}
                />
              </Form.Group>
            )}
            <Form.Group className="mb-5">
              <Form.Label>{options.descriptionLabel}</Form.Label>
              <Field
                name="description"
                component={InputField}
                as="textarea"
                className="h-150 form-control-solid"
                placeholder={options.descriptionPlaceholder}
                required={true}
                disabled={submitting}
              />
            </Form.Group>
            {!hideProjectAndResourceFields && (
              <>
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
              </>
            )}
            {attachments.length > 0 && (
              <Form.Group className="mb-5">
                <Form.Label>{translate('Template files')}</Form.Label>
                <AttachmentsList attachments={attachments} />
              </Form.Group>
            )}
            <Form.Group className="mb-5">
              <Form.Label>{translate('Attachments')}</Form.Label>
              <Field name="files" component={FileField} disabled={submitting} />
            </Form.Group>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton
          block={false}
          submitting={submitting}
          label={options.submitTitle}
        />
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  ),
);
