import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { change, Field } from 'redux-form';

import { SelectField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';

import { FormGroup } from '../FormGroup';

import { SINGLE_OFFERING_IMPORT_FORM_ID } from './constants';
import { useFormData } from './utils';

export const ImportConfigurationTab: FunctionComponent = () => {
  const formData = useFormData();

  const categoriesQuery = useQuery({
    queryKey: ['marketplaceCategories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const dispatch = useDispatch();
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
        dispatch(change(SINGLE_OFFERING_IMPORT_FORM_ID, 'category', catObj));
      }
    }
  }, [categoriesQuery.data, formData._category_name, dispatch]);

  return (
    <FormContainer submitting={false}>
      <Row className="mb-7">
        <Col md={12}>
          <FormGroup
            label={translate('Target category')}
            description={translate(
              'Optional: specify a different category for the imported offering. If not set, uses the category from the export data.',
            )}
            spaceless
          >
            <Field
              name="category"
              component={SelectField}
              placeholder={translate('Select category...')}
              options={categoriesQuery.data}
              isClearable
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.title}
              isLoading={categoriesQuery.isLoading}
            />
          </FormGroup>
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
          />

          <Field
            name="import_plans"
            component={AwesomeCheckboxField}
            label={translate('Import plans')}
            help_text={translate('Include pricing plans in the import')}
          />

          <Field
            name="import_screenshots"
            component={AwesomeCheckboxField}
            label={translate('Import screenshots')}
            help_text={translate('Include offering screenshots in the import')}
          />

          <Field
            name="import_files"
            component={AwesomeCheckboxField}
            label={translate('Import files')}
            help_text={translate('Include attached files in the import')}
          />

          <Field
            name="import_endpoints"
            component={AwesomeCheckboxField}
            label={translate('Import access endpoints')}
            help_text={translate('Include access endpoint configurations')}
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
          />

          <Field
            name="import_terms_of_service"
            component={AwesomeCheckboxField}
            label={translate('Import terms of service')}
            help_text={translate('Include terms of service configurations')}
          />

          <Field
            name="import_plugin_options"
            component={AwesomeCheckboxField}
            label={translate('Import plugin options')}
            help_text={translate('Include plugin-specific options')}
          />

          <Field
            name="import_secret_options"
            component={AwesomeCheckboxField}
            label={translate('Import secret options')}
            help_text={translate(
              'WARNING: Import secret options (will overwrite existing secrets)',
            )}
          />

          <Field
            name="overwrite_existing"
            component={AwesomeCheckboxField}
            label={translate('Overwrite existing')}
            help_text={translate(
              'Overwrite existing offering if one with the same name exists',
            )}
          />

          <Field
            name="preserve_state"
            component={AwesomeCheckboxField}
            label={translate('Preserve state')}
            help_text={translate(
              "Preserve offering state from export, otherwise set to 'Draft'",
            )}
          />
        </Col>
      </Row>
    </FormContainer>
  );
};
