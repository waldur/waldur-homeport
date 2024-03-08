import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showPlanDetailsDialog } from '@waldur/marketplace/details/plan/actions';
import { Field } from '@waldur/resource/summary';

export const PlanDetailsField = ({ resource }) => {
  const dispatch = useDispatch();
  return resource.plan_name ? (
    <Field
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
