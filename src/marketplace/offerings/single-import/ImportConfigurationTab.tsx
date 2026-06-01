import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';

import { STALE_TIME } from '@/core/constants';
import { SelectGroup } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { getCategories } from '@/marketplace/common/api';

import { SingleOfferingImportFormData } from './types';

export const ImportConfigurationTab: FunctionComponent = () => {
  const { values: formData } = useFormState<SingleOfferingImportFormData>();
  const form = useForm();

  const categoriesQuery = useQuery({
    queryKey: ['marketplaceCategories'],
    queryFn: getCategories,
    staleTime: STALE_TIME,
  });

  // Auto-set category based on imported file metadata
  useEffect(() => {
    if (
      !formData._category_name ||
      !categoriesQuery.data?.length ||
      formData.category
    ) {
      return;
    }

    const categoryName = formData._category_name;
    if (categoryName) {
      const catObj = categoriesQuery.data?.find(
        (cat) => cat.title === categoryName,
      );
      if (catObj) {
        form.change('category', catObj);
      }
    }
  }, [categoriesQuery.data, formData._category_name, form]);

  return (
    <>
      <Row className="mb-7">
        <Col md={12}>
          <SelectGroup
            name="category"
            placeholder={translate('Select category...')}
            options={categoriesQuery.data}
            isClearable
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.title}
            isLoading={categoriesQuery.isLoading}
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
          <Field
            name="import_components"
            component={AwesomeCheckboxField}
            label={translate('Import components')}
            help_text={translate('Include offering components in the import')}
            type="checkbox"
          />

          <Field
            name="import_plans"
            component={AwesomeCheckboxField}
            label={translate('Import plans')}
            help_text={translate('Include pricing plans in the import')}
            type="checkbox"
          />

          <Field
            name="import_screenshots"
            component={AwesomeCheckboxField}
            label={translate('Import screenshots')}
            help_text={translate('Include offering screenshots in the import')}
            type="checkbox"
          />

          <Field
            name="import_files"
            component={AwesomeCheckboxField}
            label={translate('Import files')}
            help_text={translate('Include attached files in the import')}
            type="checkbox"
          />

          <Field
            name="import_endpoints"
            component={AwesomeCheckboxField}
            label={translate('Import access endpoints')}
            help_text={translate('Include access endpoint configurations')}
            type="checkbox"
          />
        </Col>
        <Col md={6}>
          <Field
            name="import_organization_groups"
            component={AwesomeCheckboxField}
            label={translate('Import organization groups')}
            help_text={translate(
              "Import organization groups associations (may fail if groups don't exist)",
            )}
            type="checkbox"
          />

          <Field
            name="import_terms_of_service"
            component={AwesomeCheckboxField}
            label={translate('Import terms of service')}
            help_text={translate('Include terms of service configurations')}
            type="checkbox"
          />

          <Field
            name="import_plugin_options"
            component={AwesomeCheckboxField}
            label={translate('Import plugin options')}
            help_text={translate('Include plugin-specific options')}
            type="checkbox"
          />

          <Field
            name="import_secret_options"
            component={AwesomeCheckboxField}
            label={translate('Import secret options')}
            help_text={translate(
              'WARNING: Import secret options (will overwrite existing secrets)',
            )}
            type="checkbox"
          />

          <Field
            name="overwrite_existing"
            component={AwesomeCheckboxField}
            label={translate('Overwrite existing')}
            help_text={translate(
              'Overwrite existing offering if one with the same name exists',
            )}
            type="checkbox"
          />

          <Field
            name="preserve_state"
            component={AwesomeCheckboxField}
            label={translate('Preserve state')}
            help_text={translate(
              "Preserve offering state from export, otherwise set to 'Draft'",
            )}
            type="checkbox"
          />
        </Col>
      </Row>
    </>
  );
};
