import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { translate } from '@waldur/i18n';
import { runOfferingScript } from '@waldur/marketplace/common/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const TestScriptButton: FunctionComponent<{
  type: string;
  disabled?: boolean;
  offering;
}> = ({ type, disabled = false, offering }) => {
  const dispatch = useDispatch();

  const [{ loading }, testScript] = useAsyncFn(async () => {
    const planUrl = offering?.plans?.length ? offering.plans[0].url : null;
    try {
      await runOfferingScript(offering.uuid, planUrl, type);
      dispatch(
        showSuccess(
          translate('{type} script was executed successfully', { type }),
        ),
      );
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('{type} script got an error', { type })),
      );
    }
  }, [offering?.plans]);

  return (
    <Button
      variant="light"
      className="btn-color-dark btn-active-color-dark me-2"
      onClick={() => testScript()}
      disabled={disabled || loading}
    >
      {loading ? <i className="fa fa-pause" /> : <i className="fa fa-play" />}{' '}
      {translate('Dry run script')}
    </Button>
  );
};
