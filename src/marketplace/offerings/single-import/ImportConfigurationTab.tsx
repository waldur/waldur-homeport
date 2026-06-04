import { FunctionComponent, useEffect, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import { marketplaceCategoriesList } from 'waldur-js-client';

import { AsyncSelectGroup, BooleanGroup } from '@/form';
import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';

import { SingleOfferingImportFormData } from './types';

export const ImportConfigurationTab: FunctionComponent = () => {
  const { values: formData } = useFormState<SingleOfferingImportFormData>();
  const form = useForm();

  const loadOptions = useMemo(
    () => createLoadOptions(marketplaceCategoriesList, 'title'),
    [],
  );

  // Auto-set category based on imported file metadata
  useEffect(() => {
    if (!formData._category_name || formData.category) {
      return;
    }

    marketplaceCategoriesList({
      query: { title: formData._category_name },
    }).then((response) => {
      if (response.data?.length) {
        const catObj = response.data.find(
          (cat) => cat.title === formData._category_name,
        );
        if (catObj) {
          form.change('category', catObj);
        }
      }
    });
  }, [formData._category_name, formData.category, form]);

  return (
    <>
      <Row className="mb-7">
        <Col md={12}>
          <AsyncSelectGroup
            name="category"
            placeholder={translate('Select category...')}
            loadOptions={loadOptions}
            defaultOptions
            isClearable
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.title}
            label={translate('Target category')}
            description={translate(
              'Optional: specify a different category for the imported offering. If not set, uses the category from the export data.',
            )}
            spaceless
          />
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <h5>{translate('Import options')}</h5>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <BooleanGroup
            name="import_components"
            label={translate('Import components')}
            description={translate('Include offering components in the import')}
          />

          <BooleanGroup
            name="import_plans"
            label={translate('Import plans')}
            description={translate('Include pricing plans in the import')}
          />

          <BooleanGroup
            name="import_screenshots"
            label={translate('Import screenshots')}
            description={translate(
              'Include offering screenshots in the import',
            )}
          />

          <BooleanGroup
            name="import_files"
            label={translate('Import files')}
            description={translate('Include attached files in the import')}
          />

          <BooleanGroup
            name="import_endpoints"
            label={translate('Import access endpoints')}
            description={translate('Include access endpoint configurations')}
          />
        </Col>
        <Col md={6}>
          <BooleanGroup
            name="import_organization_groups"
            label={translate('Import organization groups')}
            description={translate(
              "Import organization groups associations (may fail if groups don't exist)",
            )}
          />

          <BooleanGroup
            name="import_terms_of_service"
            label={translate('Import terms of service')}
            description={translate('Include terms of service configurations')}
          />

          <BooleanGroup
            name="import_plugin_options"
            label={translate('Import plugin options')}
            description={translate('Include plugin-specific options')}
          />

          <BooleanGroup
            name="import_secret_options"
            label={translate('Import secret options')}
            description={translate(
              'WARNING: Import secret options (will overwrite existing secrets)',
            )}
          />

          <BooleanGroup
            name="overwrite_existing"
            label={translate('Overwrite existing')}
            description={translate(
              'Overwrite existing offering if one with the same name exists',
            )}
          />

          <BooleanGroup
            name="preserve_state"
            label={translate('Preserve state')}
            description={translate(
              "Preserve offering state from export, otherwise set to 'Draft'",
            )}
          />
        </Col>
      </Row>
    </>
  );
};
