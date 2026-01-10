import { FC, useCallback, useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { ConflictOfInterest, conflictsOfInterestWaive } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface WaiveCOIDialogProps {
  resolve: {
    coi: ConflictOfInterest;
    fetch: () => void;
  };
}

export const WaiveCOIDialog: FC<WaiveCOIDialogProps> = ({ resolve }) => {
  const dispatch = useDispatch();
  const [managementPlan, setManagementPlan] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!managementPlan.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await conflictsOfInterestWaive({
        path: { uuid: resolve.coi.uuid },
        body: {
          status: 'waived',
          management_plan: managementPlan,
          review_notes: reviewNotes,
        },
      });
      dispatch(showSuccess(translate('Conflict of interest waived.')));
      dispatch(closeModalDialog());
      resolve.fetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Failed to waive conflict.')),
      );
    } finally {
      setSubmitting(false);
    }
  }, [resolve, managementPlan, reviewNotes, dispatch]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{translate('Waive conflict of interest')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-4">
          {translate(
            'Waiving allows the reviewer to continue despite the conflict. A management plan is required to document how the conflict will be managed.',
          )}
        </p>

        <Form.Group className="mb-4">
          <Form.Label>
            {translate('Reviewer')}:{' '}
            <strong>{resolve.coi.reviewer_name}</strong>
          </Form.Label>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>
            {translate('Proposal')}:{' '}
            <strong>{resolve.coi.proposal_name}</strong>
          </Form.Label>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>
            {translate('Conflict type')}:{' '}
            <strong>{resolve.coi.coi_type_display}</strong>
          </Form.Label>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="required">
            {translate('Management plan')}
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={managementPlan}
            onChange={(e) => setManagementPlan(e.target.value)}
            placeholder={translate(
              'Describe how this conflict of interest will be managed...',
            )}
            required
          />
          <Form.Text className="text-muted">
            {translate(
              'Document the measures that will be taken to ensure fair and unbiased review.',
            )}
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>{translate('Review notes (optional)')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder={translate('Additional notes...')}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton disabled={submitting} />
        <SubmitButton
          submitting={submitting}
          disabled={!managementPlan.trim()}
          label={translate('Waive conflict')}
          onClick={handleSubmit}
        />
      </Modal.Footer>
    </>
  );
};
