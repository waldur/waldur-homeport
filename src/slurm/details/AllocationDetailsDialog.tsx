import * as React from 'react';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { AllocationUsageTable } from './AllocationUsageTable';

export const AllocationDetailsDialog = ({ resolve: { resource } }) => (
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
