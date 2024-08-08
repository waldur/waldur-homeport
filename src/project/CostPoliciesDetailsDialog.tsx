import { CostPoliciesListTable } from '@waldur/customer/cost-policies/CostPoliciesList';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

export const CostPoliciesDetailsDialog = ({ resolve: { project } }) => {
  return (
    <ModalDialog title={translate('View policy')} closeButton>
      <CostPoliciesListTable
        table="ProjectCostPoliciesList"
        filter={{ project_uuid: project.uuid }}
        hasActionBar={false}
        rowActions={null}
        hideColumns={['project', 'price_estimate']}
      />
    </ModalDialog>
  );
};
