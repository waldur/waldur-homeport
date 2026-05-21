import { useEffect, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { Field, useFormState, useForm } from 'react-final-form';
import { useAsync } from 'react-use';
import { supportTemplatesList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { FormGroup, SelectField, StringField, TextField } from '@/form';
import { translate } from '@/i18n';

import { TEMPLATE_TYPE_TO_NAME } from '../types/constants';

import { AttachmentsGroup } from './AttachmentsGroup';
import { AttachmentsList } from './AttachmentsList';

export const IssueDescriptionTab = () => {
  const form = useForm();
  const { values, submitting } = useFormState();
  const issueType = values.type;
  const issueTemplate = values.template;

  const templateState = useAsync(() =>
    getAllPages((page) =>
      supportTemplatesList({ query: { page, page_size: MAX_PAGE_SIZE } }),
    ),
  );

  // Filter templates based on issue type
  // Template.issue_type is like 'INFORMATIONAL', issueType.id is like 'Informational'
  const filteredTemplates = useMemo(() => {
    if (!templateState.value || !issueType) return [];
    const typeId = typeof issueType === 'string' ? issueType : issueType.id;
    return templateState.value.filter(
      (option) => TEMPLATE_TYPE_TO_NAME[option.issue_type] === typeId,
    );
  }, [templateState.value, issueType]);

  useEffect(() => {
    if (issueTemplate) {
      form.change('summary', issueTemplate.name);
      form.change('description', issueTemplate.description);
    }
  }, [issueTemplate, form]);

  useEffect(() => {
    if (filteredTemplates.length == 0 && issueTemplate) {
      form.change('template', undefined);
      form.change('summary', '');
      form.change('description', '');
    }
  }, [filteredTemplates, issueTemplate, form]);

  const templateFiles = issueTemplate ? issueTemplate.attachments : [];

  return templateState.loading ? (
    <LoadingSpinner />
  ) : templateState.error ? (
    <>{translate('Unable to load data.')}</>
  ) : (
    <>
      {filteredTemplates.length > 0 && (
        <Field
          name="template"
          component={FormGroup}
          label={translate('Template')}
        >
          <SelectField
            placeholder={translate('Select issue template...')}
            options={filteredTemplates}
            isDisabled={submitting}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            isClearable={true}
          />
        </Field>
      )}
      <Field
        name="summary"
        component={FormGroup}
        required={true}
        validate={required}
        label={translate('Title')}
      >
        <StringField disabled={submitting} />
      </Field>
      <Field
        name="description"
        component={FormGroup}
        required={true}
        validate={required}
        label={translate('Request description')}
      >
        <TextField rows={3} disabled={submitting} />
      </Field>
      {templateFiles.length > 0 && (
        <Form.Group className="mb-5">
          <Form.Label>{translate('Template files')}</Form.Label>
          <AttachmentsList attachments={templateFiles} />
        </Form.Group>
      )}
      <AttachmentsGroup />
    </>
  );
};
