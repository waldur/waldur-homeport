import { useDispatch } from 'react-redux';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { showPlanDetailsDialog } from '@waldur/marketplace/details/plan/actions';

export const PlanDetailsField = ({ resource }) => {
  const dispatch = useDispatch();
  return resource.plan_name ? (
    <FormTable.Item
      label={translate('Plan')}
      value={
        <>
          {resource.plan_name}{' '}
          <button
            className="text-link"
            type="button"
            onClick={() => dispatch(showPlanDetailsDialog(resource.uuid))}
          >
            [{translate('Show plan')}]
          </button>
        </>
      }
    />
  ) : null;
};
