import { FC, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { OfferingExportParametersRequest } from 'waldur-js-client';

import { FormFooter, BooleanGroup } from '@/form';
import { translate } from '@/i18n';

export const ExportOfferingDialog: FC<any> = ({ resolve }) => {
  const onSubmit = (formData: OfferingExportParametersRequest) => {
    return resolve.onExport(formData);
  };

  const initialValues = useMemo(
    () => ({
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
    }),
    [],
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
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

                <BooleanGroup
                  name="include_components"
                  label={translate('Include components')}
                  description={translate(
                    'Include offering components in export',
                  )}
                />

                <BooleanGroup
                  name="include_plans"
                  label={translate('Include plans')}
                  description={translate('Include pricing plans in export')}
                />

                <BooleanGroup
                  name="include_screenshots"
                  label={translate('Include screenshots')}
                  description={translate(
                    'Include offering screenshots in export',
                  )}
                />

                <BooleanGroup
                  name="include_files"
                  label={translate('Include files')}
                  description={translate('Include offering files in export')}
                />

                <BooleanGroup
                  name="include_endpoints"
                  label={translate('Include access endpoints')}
                  description={translate(
                    'Include offering access endpoints in export',
                  )}
                />

                <BooleanGroup
                  name="include_organization_groups"
                  label={translate('Include organization groups')}
                  description={translate(
                    'Include organization groups associations in export',
                  )}
                />
              </div>

              <div className="col-md-6">
                <h6>{translate('Advanced Options')}</h6>

                <BooleanGroup
                  name="include_terms_of_service"
                  label={translate('Include terms of service')}
                  description={translate(
                    'Include terms of service configurations in export',
                  )}
                />

                <BooleanGroup
                  name="include_plugin_options"
                  label={translate('Include plugin options')}
                  description={translate('Include plugin options in export')}
                />

                <BooleanGroup
                  name="include_secret_options"
                  label={translate('Include secret options')}
                  description={translate(
                    'WARNING: Include secret options in export (sensitive data)',
                  )}
                />

                <BooleanGroup
                  name="include_attributes"
                  label={translate('Include attributes')}
                  description={translate(
                    'Include offering attributes in export',
                  )}
                />

                <BooleanGroup
                  name="include_options"
                  label={translate('Include options')}
                  description={translate('Include offering options in export')}
                />

                <BooleanGroup
                  name="include_resource_options"
                  label={translate('Include resource options')}
                  description={translate('Include resource options in export')}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <FormFooter
              submitLabel={translate('Export')}
              submitVariant="success"
            />
          </Modal.Footer>
        </form>
      )}
    />
  );
};
