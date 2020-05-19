import * as React from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import Select from 'react-select';
import { Field, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { AttachmentsList } from './AttachmentsList';
import { FORM_ID } from './constants';
import { FileField } from './FileField';
import { IssueHeader } from './IssueHeader';
import { IssueTypeRenderer } from './IssueTypeRenderer';
import { IssueFormData, OwnProps } from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SelectField = ({ input: { value, onChange }, meta, ...props }) => (
  <Select value={value} onChange={onChange} {...props} />
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const InputField = ({ input, meta, ...props }) => (
  <FormControl {...input} {...props} />
);

export const IssueCreateForm = reduxForm<IssueFormData, OwnProps>({
  form: FORM_ID,
})(
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
                <Field
                  name="type"
                  component={SelectField}
                  placeholder={translate('Select request type...')}
                  options={issueTypes}
                  disabled={submitting}
                  valueKey="id"
                  labelKey="label"
                  optionRenderer={IssueTypeRenderer}
                  valueRenderer={IssueTypeRenderer}
                  clearable={false}
                />
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
                  disabled={submitting}
                  valueKey="uuid"
                  labelKey="name"
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
