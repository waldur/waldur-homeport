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
          <a
            className="cursor-pointer text-dark text-decoration-underline text-hover-primary"
            onClick={() => dispatch(showPlanDetailsDialog(resource.uuid))}
          >
            [{translate('Show plan')}]
          </a>
        </>
      }
    />
  ) : null;
};
