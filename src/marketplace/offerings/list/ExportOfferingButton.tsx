import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';
import {
  marketplaceProviderOfferingsExportOffering,
  OfferingExportParametersRequest,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { ActionsDropdownItem } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { ExportOfferingDialog } from './ExportOfferingDialog';
import { generateOfferingExportYaml } from './offeringExportYaml';

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
        const yamlContent = generateOfferingExportYaml(exportData.export_data);

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

  const openExportDialog = () => {
    openDialog(ExportOfferingDialog, {
      resolve: {
        offering: row,
        onExport: exportOffering,
      },
    });
  };

  return (
    <ActionsDropdownItem onSelect={openExportDialog}>
      <span className="svg-icon svg-icon-2">
        <DownloadSimpleIcon weight="bold" />
      </span>
      {translate('Export')}
    </ActionsDropdownItem>
  );
};
