import { PencilIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { marketplaceOfferingTermsOfServiceUpdate } from 'waldur-js-client';

import { SafeMarkdown } from '@waldur/core/SafeMarkdown';
import { required } from '@waldur/core/validators';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import MarkdownEditor from '@waldur/form/MarkdownEditor';
import { SelectField } from '@waldur/form/SelectField';
import { StringField } from '@waldur/form/StringField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

const addAsOptions = [
  { value: 'markdown', label: translate('Markdown') },
  { value: 'external_link', label: translate('External link') },
];

export const TosEditDialog = ({ resolve: { tos, refetch } }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('write');

  const onSubmit = async (formData) => {
    try {
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

      await marketplaceOfferingTermsOfServiceUpdate({
        path: { uuid: tos.uuid },
        body: updateData,
      });

      dispatch(
        showSuccess(
          translate('Terms of Service has been updated successfully.'),
        ),
      );
      await refetch();
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to update Terms of Service.'),
        ),
      );
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{
        version: tos.version,
        terms_of_service: tos.terms_of_service || '',
        terms_of_service_link: tos.terms_of_service_link || '',
        is_active: tos.is_active || false,
        requires_reconsent: tos.requires_reconsent || false,
        add_as: tos.terms_of_service ? 'markdown' : 'external_link',
      }}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit ToS {version}', {
              version: tos.version,
            })}
            iconNode={<PencilIcon weight="bold" />}
            closeButton
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
              <FormGroup label={translate('Version')} required>
                <Field
                  name="version"
                  validate={required}
                  component={StringField as any}
                />
              </FormGroup>

              <FormGroup label={translate('Add as')} required>
                <Field
                  name="add_as"
                  component={SelectField as any}
                  options={addAsOptions}
                  simpleValue
                />
              </FormGroup>

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
                          component={MarkdownEditor as any}
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
                <FormGroup label={translate('Terms of Service Link')} required>
                  <Field
                    name="terms_of_service_link"
                    validate={required}
                    component={StringField as any}
                  />
                </FormGroup>
              )}

              <div className="mb-3">
                <Field
                  name="is_active"
                  component={AwesomeCheckboxField as any}
                  label={translate('Active')}
                />
              </div>

              <div className="mb-3">
                <Field
                  name="requires_reconsent"
                  component={AwesomeCheckboxField as any}
                  label={translate('Requires re-consent')}
                />
              </div>
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
