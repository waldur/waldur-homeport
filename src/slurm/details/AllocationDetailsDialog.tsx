import { FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { AllocationUsageTable } from './AllocationUsageTable';

export const AllocationDetailsDialog: FunctionComponent<{
  resolve: { resource };
}> = ({ resolve: { resource } }) => (
  <>
    <Modal.Header>
      <Modal.Title>{translate('SLURM allocation usage')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <AllocationUsageTable resource={resource} />
    </Modal.Body>
    <Modal.Footer>
      <CloseDialogButton />
    </Modal.Footer>
  </>
);
