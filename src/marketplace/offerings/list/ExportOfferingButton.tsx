import { DownloadSimpleIcon } from '@phosphor-icons/react';
import {
  marketplaceProviderOfferingsExportOffering,
  OfferingExportParametersRequest,
} from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { saveFile } from '@/core/saveFile';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
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
        saveFile(
          blob,
          `${exportData.offering_name || row.name || 'offering'}-export.yaml`,
        );

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
    <Menu.Item
      icon={<DownloadSimpleIcon weight="bold" />}
      onSelect={openExportDialog}
    >
      {translate('Export')}
    </Menu.Item>
  );
};
