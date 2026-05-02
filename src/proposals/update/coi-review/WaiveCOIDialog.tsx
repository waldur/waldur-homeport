import { FC, useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { ConflictOfInterest, conflictsOfInterestWaive } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface WaiveCOIDialogProps {
  resolve: {
    coi: ConflictOfInterest;
    fetch: () => void;
  };
}

export const WaiveCOIDialog: FC<WaiveCOIDialogProps> = ({ resolve }) => {
  const [managementPlan, setManagementPlan] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  const waiveMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      conflictsOfInterestWaive({
        path: { uuid: resolve.coi.uuid },
        body: {
          status: 'waived',
          management_plan: managementPlan,
          review_notes: reviewNotes,
        },
      }),
    successMessage: translate('Conflict of interest waived.'),
    errorMessage: translate('Failed to waive conflict.'),
    refetch: resolve.fetch,
  });

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
        <CloseDialogButton disabled={waiveMutation.isPending} />
        <SubmitButton
          submitting={waiveMutation.isPending}
          disabled={!managementPlan.trim()}
          label={translate('Waive conflict')}
          onClick={() => waiveMutation.mutate()}
        />
      </Modal.Footer>
    </>
  );
};
