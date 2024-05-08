import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { updateAccessSubnet } from './api';

export const AccessSubnetEditDialog = ({ refetch, row }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    inet: row.inet,
    description: row.description,
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAccessSubnet(row.uuid, formData);
      dispatch(showSuccess(translate('Access subnet has been updated.')));
      refetch();
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to update access subnet.')),
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalDialog
        title={translate('Edit Access Subnet')}
        closeButton
        footer={
          <Button type="submit" variant="primary" size="sm">
            {translate('Update')}
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
          />
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
