import { FC, useMemo } from 'react';
import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { PermissionOptions } from './PermissionOptions';
import { RoleForm } from './RoleForm';

interface RoleEditDialogProps {
  onSubmit(payload): void;
  onCancel(): void;
  resolve: { row };
}

const FlatPermissionOptions = PermissionOptions.flatMap(
  ({ options }) => options,
);

export const RoleEditDialog: FC<RoleEditDialogProps> = (props) => {
  const initialValues = useMemo(
    () => ({
      name: props.resolve.row.name,
      description: props.resolve.row.description,
      permissions: props.resolve.row.permissions
        .map((id) => FlatPermissionOptions.find(({ value }) => value === id))
        .filter((option) => option),
    }),
    [props.resolve.row],
  );
  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Edit role')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <RoleForm {...props} initialValues={initialValues} />
      </Modal.Body>
    </>
  );
};
