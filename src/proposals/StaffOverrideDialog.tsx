import { FC, useCallback, useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface StaffOverrideDialogProps {
  resolve: {
    onSubmit: (overrideReason: string) => Promise<unknown>;
    title: string;
    description: string;
    successMessage: string;
    errorMessage: string;
    submitLabel: string;
    fetch: () => void;
  };
}

export const StaffOverrideDialog: FC<StaffOverrideDialogProps> = ({
  resolve,
}) => {
  const dispatch = useDispatch();
  const [overrideReason, setOverrideReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!overrideReason.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await resolve.onSubmit(overrideReason);
      dispatch(showSuccess(resolve.successMessage));
      dispatch(closeModalDialog());
      resolve.fetch();
    } catch (error) {
      dispatch(showErrorResponse(error, resolve.errorMessage));
    } finally {
      setSubmitting(false);
    }
  }, [resolve, overrideReason, dispatch]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{resolve.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-4">{resolve.description}</p>

        <Form.Group className="mb-4">
          <Form.Label className="required">
            {translate('Override reason')}
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder={translate('Explain why this override is necessary...')}
            required
          />
          <Form.Text className="text-muted">
            {translate('This reason will be recorded for audit purposes.')}
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => dispatch(closeModalDialog())}
          disabled={submitting}
        >
          {translate('Cancel')}
        </button>
        <SubmitButton
          submitting={submitting}
          disabled={!overrideReason.trim()}
          label={resolve.submitLabel}
          onClick={handleSubmit}
        />
      </Modal.Footer>
    </>
  );
};
