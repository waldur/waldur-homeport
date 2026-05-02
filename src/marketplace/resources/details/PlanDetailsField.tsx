import { lazyComponent } from '@/core/lazyComponent';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const PlanDetailsDialog = lazyComponent(() =>
  import('@/marketplace/details/plan/PlanDetailsDialog').then((module) => ({
    default: module.PlanDetailsDialog,
  })),
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
