import { FC } from 'react';
import { Modal } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';
import { OfferingExportParametersRequest } from 'waldur-js-client';

import { FormFooter } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';

const ExportOfferingForm: FC<any> = ({ handleSubmit, submitting, resolve }) => {
  const onSubmit = (formData: OfferingExportParametersRequest) => {
    return resolve.onExport(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Modal.Header>
        <Modal.Title>{translate('Export offering')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {translate(
            'Configure export parameters for offering "{offering_name}".',
            { offering_name: resolve.offering.name },
          )}
        </p>

        <div className="row">
          <div className="col-md-6">
            <h6>{translate('Core Components')}</h6>

            <Field
              name="include_components"
              component={AwesomeCheckboxField}
              label={translate('Include components')}
              help_text={translate('Include offering components in export')}
            />

            <Field
              name="include_plans"
              component={AwesomeCheckboxField}
              label={translate('Include plans')}
              help_text={translate('Include pricing plans in export')}
            />

            <Field
              name="include_screenshots"
              component={AwesomeCheckboxField}
              label={translate('Include screenshots')}
              help_text={translate('Include offering screenshots in export')}
            />

            <Field
              name="include_files"
              component={AwesomeCheckboxField}
              label={translate('Include files')}
              help_text={translate('Include offering files in export')}
            />

            <Field
              name="include_endpoints"
              component={AwesomeCheckboxField}
              label={translate('Include access endpoints')}
              help_text={translate(
                'Include offering access endpoints in export',
              )}
            />

            <Field
              name="include_organization_groups"
              component={AwesomeCheckboxField}
              label={translate('Include organization groups')}
              help_text={translate(
                'Include organization groups associations in export',
              )}
            />
          </div>

          <div className="col-md-6">
            <h6>{translate('Advanced Options')}</h6>

            <Field
              name="include_terms_of_service"
              component={AwesomeCheckboxField}
              label={translate('Include terms of service')}
              help_text={translate(
                'Include terms of service configurations in export',
              )}
            />

            <Field
              name="include_plugin_options"
              component={AwesomeCheckboxField}
              label={translate('Include plugin options')}
              help_text={translate('Include plugin options in export')}
            />

            <Field
              name="include_secret_options"
              component={AwesomeCheckboxField}
              label={translate('Include secret options')}
              help_text={translate(
                'WARNING: Include secret options in export (sensitive data)',
              )}
            />

            <Field
              name="include_attributes"
              component={AwesomeCheckboxField}
              label={translate('Include attributes')}
              help_text={translate('Include offering attributes in export')}
            />

            <Field
              name="include_options"
              component={AwesomeCheckboxField}
              label={translate('Include options')}
              help_text={translate('Include offering options in export')}
            />

            <Field
              name="include_resource_options"
              component={AwesomeCheckboxField}
              label={translate('Include resource options')}
              help_text={translate('Include resource options in export')}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <FormFooter
          submitting={submitting}
          submitLabel={translate('Export')}
          submitVariant="success"
        />
      </Modal.Footer>
    </form>
  );
};

const enhance = reduxForm({
  form: 'ExportOfferingDialog',
  initialValues: {
    include_components: true,
    include_plans: true,
    include_screenshots: true,
    include_files: true,
    include_endpoints: true,
    include_organization_groups: true,
    include_terms_of_service: true,
    include_plugin_options: true,
    include_secret_options: true,
    include_attributes: true,
    include_options: true,
    include_resource_options: true,
  },
});

export const ExportOfferingDialog = enhance(ExportOfferingForm);
