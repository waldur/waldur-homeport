import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  marketplaceProviderOfferingsExportOffering,
  OfferingExportParametersRequest,
  OfferingExportResponse,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { ExportOfferingDialog } from './ExportOfferingDialog';

interface ExportOfferingButtonProps {
  row: any;
}

export const ExportOfferingButton = ({ row }: ExportOfferingButtonProps) => {
  const user = useUser();
  const { showErrorResponse, showSuccess } = useNotify();

  const { openDialog } = useModal();

  const blobUrlsRef = useRef<string[]>([]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        window.URL.revokeObjectURL(url);
      });
    };
  }, []);

  const canExportOffering = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING,
    customerId: row.customer_uuid,
  });

  if (!canExportOffering) {
    return null;
  }

  const exportOffering = async (
    parameters: OfferingExportParametersRequest,
  ) => {
    try {
      const response = await marketplaceProviderOfferingsExportOffering({
        path: { uuid: row.uuid },
        body: parameters,
      });

      if (response.data) {
        const exportData = response.data;

        // Create YAML content from the structured export data
        const yamlContent = generateYamlFromExportData(exportData);

        // Create a blob with YAML content
        const blob = new Blob([yamlContent], {
          type: 'text/yaml',
        });
        const url = window.URL.createObjectURL(blob);
        blobUrlsRef.current.push(url); // Track for cleanup
        const link = document.createElement('a');
        link.href = url;
        link.download = `${exportData.offering_name || row.name || 'offering'}-export.yaml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        // Remove from tracking since already cleaned up
        blobUrlsRef.current = blobUrlsRef.current.filter((u) => u !== url);

        showSuccess(translate('Offering exported successfully as YAML.'));
      }
    } catch (error) {
      showErrorResponse(error, translate('Error while exporting offering.'));
    }
  };

  // Convert structured export data to YAML format
  const generateYamlFromExportData = (
    exportData: OfferingExportResponse,
  ): string => {
    const { export_data } = exportData;
    let yaml = '';

    // Helper function to escape YAML strings
    const escapeYamlString = (str: string): string => {
      if (!str) return '""';
      // If string contains special characters, quotes, or newlines, wrap in quotes and escape
      if (
        str.includes('\n') ||
        str.includes('"') ||
        str.includes("'") ||
        str.includes(':') ||
        str.includes('#')
      ) {
        return `"${str.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
      }
      return str;
    };

    // Offering section
    yaml += 'offering:\n';
    yaml += `  name: ${escapeYamlString(export_data.offering.name)}\n`;
    yaml += `  description: ${escapeYamlString(export_data.offering.description)}\n`;
    yaml += `  full_description: ${escapeYamlString(export_data.offering.full_description)}\n`;
    yaml += `  vendor_details: ${escapeYamlString(export_data.offering.vendor_details)}\n`;
    yaml += `  getting_started: ${escapeYamlString(export_data.offering.getting_started)}\n`;
    yaml += `  integration_guide: ${escapeYamlString(export_data.offering.integration_guide)}\n`;
    yaml += `  type: ${export_data.offering.type}\n`;
    yaml += `  shared: ${export_data.offering.shared}\n`;
    yaml += `  billable: ${export_data.offering.billable}\n`;
    yaml += `  state: ${export_data.offering.state}\n`;
    yaml += `  category_name: ${export_data.offering.category_name || 'null'}\n`;
    yaml += `  country: ${escapeYamlString(export_data.offering.country)}\n`;
    yaml += `  latitude: ${export_data.offering.latitude || 'null'}\n`;
    yaml += `  longitude: ${export_data.offering.longitude || 'null'}\n`;
    yaml += `  access_url: ${escapeYamlString(export_data.offering.access_url)}\n`;
    yaml += `  paused_reason: ${escapeYamlString(export_data.offering.paused_reason)}\n`;

    // Add attributes and options if they exist
    if (export_data.offering.attributes) {
      yaml += `  attributes: ${JSON.stringify(export_data.offering.attributes)}\n`;
    }
    if (export_data.offering.options) {
      yaml += `  options: ${JSON.stringify(export_data.offering.options)}\n`;
    }

    // Components section
    if (export_data.components && export_data.components.length > 0) {
      yaml += 'components:\n';
      export_data.components.forEach((component) => {
        yaml += `- type: ${component.type}\n`;
        yaml += `  name: ${escapeYamlString(component.name)}\n`;
        yaml += `  description: ${escapeYamlString(component.description)}\n`;
        yaml += `  billing_type: ${component.billing_type}\n`;
        yaml += `  measured_unit: ${component.measured_unit}\n`;
        yaml += `  unit_factor: ${component.unit_factor || 'null'}\n`;
        yaml += `  limit_period: ${component.limit_period || 'null'}\n`;
        yaml += `  limit_amount: ${component.limit_amount || 'null'}\n`;
        yaml += `  article_code: ${escapeYamlString(component.article_code)}\n`;
        yaml += `  backend_id: ${escapeYamlString(component.backend_id)}\n`;
      });
    }

    // Plans section
    if (export_data.plans && export_data.plans.length > 0) {
      yaml += 'plans:\n';
      export_data.plans.forEach((plan) => {
        yaml += `- name: ${escapeYamlString(plan.name)}\n`;
        yaml += `  description: ${escapeYamlString(plan.description)}\n`;
        yaml += `  unit_price: ${plan.unit_price}\n`;
        yaml += `  unit: ${plan.unit}\n`;
        yaml += `  archived: ${plan.archived}\n`;
        yaml += `  max_amount: ${plan.max_amount || 'null'}\n`;
        yaml += `  article_code: ${escapeYamlString(plan.article_code)}\n`;
        yaml += `  backend_id: ${escapeYamlString(plan.backend_id)}\n`;

        // Plan components
        if (plan.components && plan.components.length > 0) {
          yaml += '  components:\n';
          plan.components.forEach((component) => {
            yaml += `  - component_type: ${component.component_type}\n`;
            yaml += `    amount: ${component.amount}\n`;
            yaml += `    price: ${component.price}\n`;
            yaml += `    future_price: ${component.future_price || 'null'}\n`;
          });
        }
      });
    }

    // Screenshots section
    if (export_data.screenshots && export_data.screenshots.length > 0) {
      yaml += 'screenshots:\n';
      export_data.screenshots.forEach((screenshot) => {
        yaml += `- name: ${escapeYamlString(screenshot.name)}\n`;
        yaml += `  description: ${escapeYamlString(screenshot.description)}\n`;
        yaml += `  image_filename: ${screenshot.image_filename}\n`;
        // Note: image_content is base64, might be very long
      });
    } else {
      yaml += 'screenshots: []\n';
    }

    // Files section
    if (export_data.files && export_data.files.length > 0) {
      yaml += 'files:\n';
      export_data.files.forEach((file) => {
        yaml += `- name: ${escapeYamlString(file.name)}\n`;
        yaml += `  filename: ${file.filename}\n`;
      });
    } else {
      yaml += 'files: []\n';
    }

    // Endpoints section
    if (export_data.endpoints && export_data.endpoints.length > 0) {
      yaml += 'endpoints:\n';
      export_data.endpoints.forEach((endpoint) => {
        yaml += `- name: ${escapeYamlString(endpoint.name)}\n`;
        yaml += `  url: ${endpoint.url}\n`;
      });
    } else {
      yaml += 'endpoints: []\n';
    }

    // Organization groups section
    if (
      export_data.organization_groups &&
      export_data.organization_groups.length > 0
    ) {
      yaml += 'organization_groups:\n';
      export_data.organization_groups.forEach((group) => {
        yaml += `- name: ${escapeYamlString(group.name)}\n`;
        yaml += `  parent_name: ${group.parent_name || 'null'}\n`;
      });
    } else {
      yaml += 'organization_groups: []\n';
    }

    // Terms of service section
    if (
      export_data.terms_of_service &&
      export_data.terms_of_service.length > 0
    ) {
      yaml += 'terms_of_service:\n';
      export_data.terms_of_service.forEach((tos) => {
        yaml += `- terms_of_service_link: ${tos.terms_of_service_link}\n`;
        yaml += `  terms_of_service: ${escapeYamlString(tos.terms_of_service)}\n`;
      });
    } else {
      yaml += 'terms_of_service: []\n';
    }

    // Plugin options section (if included in export)
    if (export_data.plugin_options) {
      yaml += `plugin_options: ${JSON.stringify(export_data.plugin_options)}\n`;
    }

    // Resource options section (if included in export)
    if (export_data.resource_options) {
      yaml += `resource_options: ${JSON.stringify(export_data.resource_options)}\n`;
    }

    // Secret options section (if included in export)
    if (export_data.secret_options) {
      yaml += `secret_options: ${JSON.stringify(export_data.secret_options)}\n`;
    }

    return yaml;
  };

  const openExportDialog = () => {
    openDialog(ExportOfferingDialog, {
      resolve: {
        offering: row,
        onExport: exportOffering,
      },
    });
  };

  return (
    <Dropdown.Item as="button" onClick={openExportDialog}>
      <span className="svg-icon svg-icon-2">
        <DownloadSimpleIcon weight="bold" />
      </span>
      {translate('Export')}
    </Dropdown.Item>
  );
};
