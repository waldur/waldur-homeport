import { FC } from 'react';
import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { CostPolicyCreateForm } from './CostPolicyCreateForm';
import { CostPolicyFormData } from './types';

interface CostPolicyCreateDialogProps {
  onSubmit(formData: CostPolicyFormData): void;
  onCancel(): void;
}

export const CostPolicyCreateDialog: FC<CostPolicyCreateDialogProps> = (
  props,
) => {
  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('New policy')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CostPolicyCreateForm {...props} />
      </Modal.Body>
    </>
  );
};
