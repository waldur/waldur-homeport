import { FunctionComponent } from 'react';
import { Button, FormGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { translate } from '@waldur/i18n';
import { runOfferingScript } from '@waldur/marketplace/common/api';
import { getOffering } from '@waldur/marketplace/offerings/store/selectors';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const TestScriptButton: FunctionComponent<{
  container;
  type: string;
  disabled?: boolean;
}> = ({ container, type, disabled = false }) => {
  const dispatch = useDispatch();
  const { offering } = useSelector(getOffering);

  const [{ loading, error }, testScript] = useAsyncFn(async () => {
    const planUrl =
      offering.plans && offering.plans.length ? offering.plans[0].url : null;
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
  }, [offering.plans]);

  return (
    <FormGroup>
      <div className={container.labelClass} />
      <div className={container.controlClass}>
        <Button
          bsStyle="success"
          onClick={() => testScript()}
          disabled={disabled || loading}
        >
          {loading ? (
            <>
              <i className="fa fa-spinner fa-spin" />{' '}
            </>
          ) : (
            <>
              <i className="fa fa-terminal" />{' '}
            </>
          )}
          {translate('Test {type}', { type })}
        </Button>
        {error && <span className="text-danger">{error.message}</span>}
      </div>
    </FormGroup>
  );
};
