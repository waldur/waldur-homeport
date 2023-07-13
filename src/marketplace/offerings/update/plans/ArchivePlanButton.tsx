import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { updateProviderOffering } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const ArchivePlanButton = ({ offering, plan, refetch }) => {
  const dispatch = useDispatch();
  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to archive plan {name}?',
          {
            name: <b>{plan.name}</b>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    const newPlans = offering.plans.filter((item) => item.uuid !== plan.uuid);
    try {
      await updateProviderOffering(offering.uuid, { plans: newPlans });
      await refetch();
      dispatch(showSuccess(translate('Plan has been archived.')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to archive plan.')));
    }
  };
  return (
    <Button className="btn-sm btn-danger" onClick={handler}>
      {translate('Archive')}
    </Button>
  );
};
