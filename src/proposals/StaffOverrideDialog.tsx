import { FC, useState } from 'react';
import { Form, Modal } from 'react-bootstrap';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
  const [overrideReason, setOverrideReason] = useState('');

  const submitMutation = useManagedMutation<any, any, void>({
    mutationFn: () => resolve.onSubmit(overrideReason),
    successMessage: resolve.successMessage,
    errorMessage: resolve.errorMessage,
    refetch: resolve.fetch,
  });

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
        <CloseDialogButton
          variant="secondary"
          disabled={submitMutation.isPending}
        />
        <SubmitButton
          submitting={submitMutation.isPending}
          disabled={!overrideReason.trim()}
          label={resolve.submitLabel}
          onClick={() => submitMutation.mutate()}
        />
      </Modal.Footer>
    </>
  );
};
