import { lazyComponent } from '@waldur/core/lazyComponent';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';

const PlanDetailsDialog = lazyComponent(() =>
  import('@waldur/marketplace/details/plan/PlanDetailsDialog').then(
    (module) => ({
      default: module.PlanDetailsDialog,
    }),
  ),
);

export const PlanDetailsField = ({ resource }) => {
  const { openDialog } = useModal();
  return resource.plan_name ? (
    <FormTable.Item
      label={translate('Plan')}
      value={
        <>
          {resource.plan_name}{' '}
          <button
            className="text-link"
            type="button"
            onClick={() =>
              openDialog(PlanDetailsDialog, {
                resolve: { resourceId: resource.uuid },
                size: 'lg',
              })
            }
          >
            [{translate('Show plan')}]
          </button>
        </>
      }
    />
  ) : null;
};
