import { ClipboardTextIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Project } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { propVal } from '@/property/propertyFields';

import { ProjectCostField } from '../ProjectCostField';

export const ProjectDetailsDialog: FC<{
  project: Project;
}> = ({ project }) => {
  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
    project.customer_display_billing_info_in_projects === false;
  return (
    <ModalDialog
      title={translate('Project details for {name}', { name: project.name })}
      subtitle={translate('Project owned by {name}', {
        name: project.customer_name,
      })}
      iconNode={<ClipboardTextIcon weight="bold" />}
      iconColor="success"
    >
      <PropertyList hideActions alignTop detailsMode>
        <PropertyItem label={translate('Name')} value={project.name} hasCopy />

        <PropertyItem
          label={translate('Owner')}
          value={project.customer_name}
          hasCopy
        />

        <PropertyItem
          label={translate('Start date')}
          value={propVal.date(project.start_date)}
          hasCopy
        />

        <PropertyItem
          label={translate('End date')}
          value={propVal.date(project.end_date)}
          hasCopy
        />

        <PropertyItem
          label={translate('Description')}
          value={project.description}
          hasCopy
        />

        {!shouldConcealPrices && (
          <PropertyItem
            label={translate('Estimated cost')}
            value={ProjectCostField({ row: project })}
            hasCopy
          />
        )}
      </PropertyList>
    </ModalDialog>
  );
};
