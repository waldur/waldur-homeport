import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  accessSubnetsCreate,
  accessSubnetsPartialUpdate,
  AccessSubnetRequest,
  PatchedAccessSubnetRequest,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export interface AccessSubnetFormProps {
  refetch(): void;
  customer_url?: string;
  row?: {
    uuid: string;
    inet: string;
    description: string;
  };
}

export const AccessSubnetForm = ({
  refetch,
  customer_url,
  row,
}: AccessSubnetFormProps) => {
  const dispatch = useDispatch();
  const isEditMode = !!row;
  const [formData, setFormData] = useState<
    AccessSubnetRequest | PatchedAccessSubnetRequest
  >({
    inet: row?.inet || '',
    description: row?.description || '',
    customer: customer_url || undefined,
  });

  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === 'inet' && !e.target.value.endsWith('/32')) {
      setError(translate('Only /32 mask is allowed.'));
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.inet.endsWith('/32')) {
      setError(translate('Only /32 mask is allowed.'));
      return;
    }

    try {
      if (isEditMode) {
        await accessSubnetsPartialUpdate({
          path: { uuid: row.uuid },
          body: formData,
        });
        dispatch(showSuccess(translate('Access subnet has been updated.')));
      } else {
        await accessSubnetsCreate({
          body: {
            ...(formData as AccessSubnetRequest),
            customer: customer_url!,
          },
        });
        dispatch(showSuccess(translate('Access subnet has been created.')));
      }
      refetch();
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          isEditMode
            ? translate('Unable to update access subnet.')
            : translate('Unable to create access subnet.'),
        ),
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalDialog
        title={
          isEditMode
            ? translate('Edit access subnet')
            : translate('Create access subnet')
        }
        closeButton
        footer={
          <Button type="submit" variant="primary" size="sm">
            {isEditMode ? translate('Update') : translate('Create')}
          </Button>
        }
      >
        <Form.Group>
          <Form.Label>{translate('CIDR')}</Form.Label>
          <Form.Control
            type="text"
            name="inet"
            value={formData.inet}
            onChange={handleInputChange}
            placeholder={translate('Example: 192.168.1.0/32')}
            isInvalid={!!error}
          />

          {error && (
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group>
          <Form.Label>{translate('Description')}</Form.Label>
          <Form.Control
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </Form.Group>
      </ModalDialog>
    </Form>
  );
};
