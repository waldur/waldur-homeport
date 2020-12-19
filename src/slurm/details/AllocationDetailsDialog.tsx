import { FunctionComponent } from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { AllocationUsageTable } from './AllocationUsageTable';

export const AllocationDetailsDialog: FunctionComponent<{
  resolve: { resource };
}> = ({ resolve: { resource } }) => (
  <>
    <ModalHeader>
      <ModalTitle>{translate('SLURM allocation usage')}</ModalTitle>
    </ModalHeader>
    <ModalBody>
      <AllocationUsageTable resource={resource} />
    </ModalBody>
    <ModalFooter>
      <CloseDialogButton />
    </ModalFooter>
  </>
);
