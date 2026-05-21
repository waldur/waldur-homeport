import { useRouter } from '@uirouter/react';
import * as yaml from 'js-yaml';
import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsImportOffering,
  OfferingExportDataRequest,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { WizardStepIndicator, useWizard } from '@/wizard';
import { useCustomer } from '@/workspace/hooks';

import { WizardButtons } from '../import/WizardButtons';
import { WizardTabs } from '../import/WizardTabs';

import { ImportErrorBoundary } from './ImportErrorBoundary';
import {
  SINGLE_OFFERING_IMPORT_STEPS,
  SINGLE_OFFERING_IMPORT_TABS,
} from './tabs';
import { SingleOfferingImportFormData } from './types';

interface SingleOfferingImportProps {
  resolve?: {
    refetch?: () => void;
  };
}

const initialValues: Partial<SingleOfferingImportFormData> = {
  import_components: true,
  import_plans: true,
  import_screenshots: true,
  import_files: true,
  import_endpoints: true,
  import_organization_groups: true,
  import_terms_of_service: true,
  import_plugin_options: true,
  import_secret_options: true,
  overwrite_existing: true,
};

export const SingleOfferingImportDialog: FunctionComponent<
  SingleOfferingImportProps
> = ({ resolve }) => {
  const refetch = resolve?.refetch;
  const { step, setStep, goBack, goNext, isFirstStep, isLastStep } = useWizard(
    SINGLE_OFFERING_IMPORT_STEPS,
  );
  const customer = useCustomer();
  const router = useRouter();

  const importMutation = useManagedMutation<
    any,
    any,
    SingleOfferingImportFormData
  >({
    mutationFn: async (formData) => {
      if (!formData.importFile) {
        throw new Error(translate('Please select a file to import.'));
      }

      const fileContent = await readFileAsText(formData.importFile);

      // Determine file type and parse accordingly
      const isJson =
        formData.importFile.name.endsWith('.json') ||
        formData.importFile.type.includes('json');
      const offeringData = isJson
        ? parseJsonToStructuredData(fileContent)
        : parseYamlToStructuredData(fileContent);

      // Prepare the import request
      const importParams = {
        customer: customer?.uuid,
        category: formData.category?.title,
        offering_data: offeringData,
        import_components: formData.import_components,
        import_plans: formData.import_plans,
        import_screenshots: formData.import_screenshots,
        import_files: formData.import_files,
        import_endpoints: formData.import_endpoints,
        import_organization_groups: formData.import_organization_groups,
        import_terms_of_service: formData.import_terms_of_service,
        import_plugin_options: formData.import_plugin_options,
        import_secret_options: formData.import_secret_options,
        overwrite_existing: formData.overwrite_existing,
      };

      const response = await marketplaceProviderOfferingsImportOffering({
        body: importParams as any,
      });

      if (response.data) {
        router.stateService.go('marketplace-offering-update', {
          offering_uuid: response.data.imported_offering_uuid,
          uuid: customer?.uuid,
        });
      }
    },
    successMessage: translate('Offering imported successfully.'),
    errorMessage: translate('Unable to import offering.'),
    refetch: refetch,
  });

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Parse JSON content into structured OfferingExportDataRequest
  const parseJsonToStructuredData = (
    jsonContent: string,
  ): OfferingExportDataRequest => {
    const parsedJson = JSON.parse(jsonContent);

    if (parsedJson.data && parsedJson.data.export_data) {
      // Handle the export-basic.json format where export_data contains YAML
      return parseYamlToStructuredData(parsedJson.data.export_data);
    } else {
      // Handle direct structured JSON format
      return parsedJson as OfferingExportDataRequest;
    }
  };

  // Parse YAML content into structured OfferingExportDataRequest using js-yaml
  const parseYamlToStructuredData = (
    yamlContent: string,
  ): OfferingExportDataRequest => {
    try {
      // Parse YAML using js-yaml library
      const parsed = yaml.load(yamlContent) as any;

      // Validate required structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid YAML structure');
      }

      if (!parsed.offering) {
        throw new Error('Missing required "offering" section');
      }

      // Map parsed YAML to OfferingExportDataRequest structure
      const result: OfferingExportDataRequest = {
        offering: {
          name: parsed.offering.name || '',
          description: parsed.offering.description || '',
          full_description: parsed.offering.full_description || '',
          vendor_details: parsed.offering.vendor_details || '',
          getting_started: parsed.offering.getting_started || '',
          integration_guide: parsed.offering.integration_guide || '',
          type: parsed.offering.type || '',
          shared:
            parsed.offering.shared === true ||
            parsed.offering.shared === 'true',
          billable:
            parsed.offering.billable === true ||
            parsed.offering.billable === 'true',
          state: parsed.offering.state || '',
          category_name: parsed.offering.category_name || null,
          country: parsed.offering.country || '',
          latitude: parsed.offering.latitude
            ? parseFloat(parsed.offering.latitude)
            : null,
          longitude: parsed.offering.longitude
            ? parseFloat(parsed.offering.longitude)
            : null,
          access_url: parsed.offering.access_url || '',
          paused_reason: parsed.offering.paused_reason || '',
          attributes: parsed.offering.attributes,
          options: parsed.offering.options,
        },
      };

      // Add optional sections if they exist
      if (parsed.components && Array.isArray(parsed.components)) {
        result.components = parsed.components.map((comp: any) => ({
          type: comp.type || '',
          name: comp.name || '',
          description: comp.description || '',
          billing_type: comp.billing_type || '',
          measured_unit: comp.measured_unit || '',
          unit_factor: comp.unit_factor ? parseInt(comp.unit_factor) : null,
          limit_period: comp.limit_period || null,
          limit_amount: comp.limit_amount ? parseInt(comp.limit_amount) : null,
          article_code: comp.article_code || '',
          backend_id: comp.backend_id || '',
        }));
      }

      if (parsed.plans && Array.isArray(parsed.plans)) {
        result.plans = parsed.plans.map((plan: any) => ({
          name: plan.name || '',
          description: plan.description || '',
          unit_price: plan.unit_price ? parseFloat(plan.unit_price) : 0,
          unit: plan.unit || '',
          archived: plan.archived === true || plan.archived === 'true',
          max_amount: plan.max_amount ? parseInt(plan.max_amount) : null,
          article_code: plan.article_code || '',
          backend_id: plan.backend_id || '',
          components:
            plan.components && Array.isArray(plan.components)
              ? plan.components.map((comp: any) => ({
                  component_type: comp.component_type || '',
                  amount: comp.amount ? parseFloat(comp.amount) : 0,
                  price: comp.price ? parseFloat(comp.price) : 0,
                  future_price: comp.future_price
                    ? parseFloat(comp.future_price)
                    : null,
                }))
              : undefined,
        }));
      }

      if (parsed.screenshots && Array.isArray(parsed.screenshots)) {
        result.screenshots = parsed.screenshots;
      }

      if (parsed.files && Array.isArray(parsed.files)) {
        result.files = parsed.files;
      }

      if (parsed.endpoints && Array.isArray(parsed.endpoints)) {
        result.endpoints = parsed.endpoints;
      }

      if (
        parsed.organization_groups &&
        Array.isArray(parsed.organization_groups)
      ) {
        result.organization_groups = parsed.organization_groups.map(
          (group: any) => ({
            name: group.name || '',
            parent_name: group.parent_name || null,
          }),
        );
      }

      if (parsed.terms_of_service && Array.isArray(parsed.terms_of_service)) {
        result.terms_of_service = parsed.terms_of_service;
      }

      // Add plugin, secret, and resource options if they exist
      if (parsed.plugin_options !== undefined) {
        result.plugin_options = parsed.plugin_options;
      }

      if (parsed.secret_options !== undefined) {
        result.secret_options = parsed.secret_options;
      }

      if (parsed.resource_options !== undefined) {
        result.resource_options = parsed.resource_options;
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to parse YAML: ${error.message}`);
    }
  };

  return (
    <ImportErrorBoundary>
      <Form<SingleOfferingImportFormData>
        onSubmit={(values) =>
          importMutation.mutateAsync(values).catch(() => {})
        }
        initialValues={initialValues}
      >
        {({ handleSubmit, submitting, invalid }) => (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Import offering')}
              subtitle={translate(
                'Import a single offering from an exported JSON or YAML file with configurable options.',
              )}
              bodyClassName="h-400px"
              footer={
                <WizardButtons
                  isLastStep={isLastStep}
                  isFirstStep={isFirstStep}
                  goBack={goBack}
                  goNext={goNext}
                  submitting={submitting}
                  invalid={invalid}
                  submitLabel={translate('Import')}
                />
              }
            >
              <WizardStepIndicator
                steps={SINGLE_OFFERING_IMPORT_STEPS}
                value={step}
                onClick={(_, i) =>
                  !invalid && setStep(SINGLE_OFFERING_IMPORT_STEPS[i])
                }
                disabled={submitting}
              />

              <WizardTabs
                steps={SINGLE_OFFERING_IMPORT_STEPS}
                currentStep={step}
                tabs={SINGLE_OFFERING_IMPORT_TABS}
                mountOnEnter={true}
              />
            </ModalDialog>
          </form>
        )}
      </Form>
    </ImportErrorBoundary>
  );
};
