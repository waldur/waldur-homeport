import { CostPoliciesListTable } from '@/customer/cost-policies/CostPoliciesList';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';

export const CostPoliciesDetailsDialog = ({ resolve: { project } }) => {
  return (
    <ModalDialog
      title={translate('View policy')}
      subtitle={
        <ScopeSubtitle label={translate('Project name')} name={project.name} />
      }
    >
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
