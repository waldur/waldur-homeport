import { PencilIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { marketplaceOfferingTermsOfServiceUpdate } from 'waldur-js-client';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { required } from '@/core/validators';
import { StringGroup, SelectGroup, NumberGroup } from '@/form';
import { FormGroup } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import MarkdownEditor from '@/form/MarkdownEditor';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

const addAsOptions = [
  { value: 'markdown', label: translate('Markdown') },
  { value: 'external_link', label: translate('External link') },
];

export const TosEditDialog = ({ resolve: { tos, refetch } }) => {
  const [activeTab, setActiveTab] = useState('write');

  const updateTosMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const updateData: any = {
        version: formData.version,
        is_active: formData.is_active,
        requires_reconsent: formData.requires_reconsent,
      };

      if (formData.add_as === 'markdown') {
        updateData.terms_of_service = formData.terms_of_service;
        updateData.terms_of_service_link = '';
      } else {
        updateData.terms_of_service_link = formData.terms_of_service_link;
        updateData.terms_of_service = '';
      }

      if (formData.requires_reconsent && formData.grace_period_days) {
        updateData.grace_period_days = formData.grace_period_days;
      }

      return marketplaceOfferingTermsOfServiceUpdate({
        path: { uuid: tos.uuid },
        body: updateData,
      });
    },
    successMessage: translate(
      'Terms of Service has been updated successfully.',
    ),
    errorMessage: translate('Unable to update Terms of Service.'),
    refetch,
  });

  return (
    <Form
      onSubmit={(values) => updateTosMutation.mutateAsync(values)}
      initialValues={{
        version: tos.version,
        terms_of_service: tos.terms_of_service || '',
        terms_of_service_link: tos.terms_of_service_link || '',
        is_active: tos.is_active || false,
        requires_reconsent: tos.requires_reconsent || false,
        grace_period_days: tos.grace_period_days || 60,
        add_as: tos.terms_of_service ? 'markdown' : 'external_link',
      }}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit ToS {version}', {
              version: tos.version,
            })}
            iconNode={<PencilIcon weight="bold" />}
            footer={
              <div className="d-flex gap-3 justify-content-end mt-4">
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  className="btn btn-primary min-w-125px"
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Update')}
                />
              </div>
            }
          >
            <div className="size-lg">
              <StringGroup
                name="version"
                validate={required}
                label={translate('Version')}
                required
              />

              <SelectGroup
                name="add_as"
                options={addAsOptions}
                simpleValue
                label={translate('Add as')}
                required
              />

              {values.add_as === 'markdown' && (
                <FormGroup label={translate('Terms of Service')} required>
                  <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-3"
                    id="tos-edit-tabs"
                  >
                    <Tab eventKey="write" title={translate('Write')}>
                      <div className="markdown-editor-wrapper">
                        <Field
                          name="terms_of_service"
                          component={MarkdownEditor}
                          required
                          autoFocus
                          hideLabel
                          spaceless
                        />
                      </div>
                    </Tab>
                    <Tab eventKey="preview" title={translate('Preview')}>
                      <div className="markdown-editor-wrapper markdown-editor-preview">
                        {values.terms_of_service ? (
                          <SafeMarkdown text={values.terms_of_service} />
                        ) : (
                          <div className="text-muted">
                            {translate(
                              'No content to preview. Switch to Write tab to add content.',
                            )}
                          </div>
                        )}
                      </div>
                    </Tab>
                  </Tabs>
                </FormGroup>
              )}

              {values.add_as === 'external_link' && (
                <StringGroup
                  name="terms_of_service_link"
                  validate={required}
                  label={translate('Terms of Service Link')}
                  required
                />
              )}

              <div className="mb-3">
                <Field
                  name="is_active"
                  component={AwesomeCheckboxField}
                  label={translate('Active')}
                />
              </div>

              <div className="mb-3">
                <Field
                  name="requires_reconsent"
                  component={AwesomeCheckboxField}
                  label={translate('Requires re-consent')}
                />
              </div>

              {values.requires_reconsent && (
                <NumberGroup
                  name="grace_period_days"
                  min={0}
                  parse={(value) => (value === '' ? undefined : Number(value))}
                  label={translate('Grace period (days)')}
                  help={translate(
                    'Number of days before outdated consents are automatically revoked. Only applies when requires re-consent is enabled.',
                  )}
                  helpEnd
                  description={translate(
                    'After this period expires, user consents for outdated terms will be automatically revoked.',
                  )}
                />
              )}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
