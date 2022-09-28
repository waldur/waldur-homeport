import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { showPlanDetailsDialog } from '../details/plan/actions';

export const PlanDetailsField = ({ resource }) => {
  const dispatch = useDispatch();
  return resource.plan_name ? (
    <Field
      label={translate('Plan')}
      value={
        <>
          {resource.plan_name}{' '}
          <a
            className="text-dark text-decoration-underline text-hover-primary"
            onClick={() => dispatch(showPlanDetailsDialog(resource.uuid))}
          >
            [{translate('Show plan')}]
          </a>
        </>
      }
    />
  ) : null;
};
