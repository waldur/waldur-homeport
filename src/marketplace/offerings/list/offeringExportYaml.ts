import { dump } from 'js-yaml';
import { OfferingExportData } from 'waldur-js-client';

// A missing value is written as null so every key stays in the file.
// Empty strings, zeroes and false are kept exactly as they are.
const orNull = <T>(value: T | undefined): T | null =>
  value === undefined ? null : value;

/**
 * Builds the object written to an offering export file. Key order and
 * section layout match what the offering import reads back.
 */
const buildOfferingExportObject = (
  exportData: OfferingExportData,
): Record<string, unknown> => {
  const { offering } = exportData;
  const result: Record<string, unknown> = {};

  const offeringSection: Record<string, unknown> = {
    name: orNull(offering.name),
    description: orNull(offering.description),
    full_description: orNull(offering.full_description),
    vendor_details: orNull(offering.vendor_details),
    getting_started: orNull(offering.getting_started),
    integration_guide: orNull(offering.integration_guide),
    type: orNull(offering.type),
    shared: orNull(offering.shared),
    billable: orNull(offering.billable),
    state: orNull(offering.state),
    category_name: orNull(offering.category_name),
    country: orNull(offering.country),
    latitude: orNull(offering.latitude),
    longitude: orNull(offering.longitude),
    access_url: orNull(offering.access_url),
    paused_reason: orNull(offering.paused_reason),
  };
  if (offering.attributes) {
    offeringSection.attributes = offering.attributes;
  }
  if (offering.options) {
    offeringSection.options = offering.options;
  }
  result.offering = offeringSection;

  if (exportData.components?.length) {
    result.components = exportData.components.map((component) => ({
      type: orNull(component.type),
      name: orNull(component.name),
      description: orNull(component.description),
      billing_type: orNull(component.billing_type),
      measured_unit: orNull(component.measured_unit),
      unit_factor: orNull(component.unit_factor),
      limit_period: orNull(component.limit_period),
      limit_amount: orNull(component.limit_amount),
      article_code: orNull(component.article_code),
      backend_id: orNull(component.backend_id),
    }));
  }

  if (exportData.plans?.length) {
    result.plans = exportData.plans.map((plan) => {
      const planSection: Record<string, unknown> = {
        name: orNull(plan.name),
        description: orNull(plan.description),
        unit_price: orNull(plan.unit_price),
        unit: orNull(plan.unit),
        archived: orNull(plan.archived),
        max_amount: orNull(plan.max_amount),
        article_code: orNull(plan.article_code),
        backend_id: orNull(plan.backend_id),
      };
      if (plan.components?.length) {
        planSection.components = plan.components.map((component) => ({
          component_type: orNull(component.component_type),
          amount: orNull(component.amount),
          price: orNull(component.price),
          future_price: orNull(component.future_price),
        }));
      }
      return planSection;
    });
  }

  // Screenshot image content is base64 and is left out of the file.
  result.screenshots = (exportData.screenshots ?? []).map((screenshot) => ({
    name: orNull(screenshot.name),
    description: orNull(screenshot.description),
    image_filename: orNull(screenshot.image_filename),
  }));

  result.files = (exportData.files ?? []).map((file) => ({
    name: orNull(file.name),
    filename: orNull(file.filename),
  }));

  result.endpoints = (exportData.endpoints ?? []).map((endpoint) => ({
    name: orNull(endpoint.name),
    url: orNull(endpoint.url),
  }));

  result.organization_groups = (exportData.organization_groups ?? []).map(
    (group) => ({
      name: orNull(group.name),
      parent_name: orNull(group.parent_name),
    }),
  );

  result.terms_of_service = (exportData.terms_of_service ?? []).map((tos) => ({
    terms_of_service_link: orNull(tos.terms_of_service_link),
    terms_of_service: orNull(tos.terms_of_service),
  }));

  if (exportData.plugin_options) {
    result.plugin_options = exportData.plugin_options;
  }
  if (exportData.resource_options) {
    result.resource_options = exportData.resource_options;
  }
  if (exportData.secret_options) {
    result.secret_options = exportData.secret_options;
  }

  return result;
};

/**
 * Serialises offering export data to YAML.
 *
 * Every string is quoted: the import parses the file as YAML 1.1, where
 * unquoted values such as `yes`, `1_000` or `1:20` would change type.
 */
export const generateOfferingExportYaml = (
  exportData: OfferingExportData,
): string =>
  dump(buildOfferingExportObject(exportData), {
    noRefs: true,
    lineWidth: -1,
    noArrayIndent: true,
    forceQuotes: true,
  });
