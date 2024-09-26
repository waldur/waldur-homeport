import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const ResourceOrderErrorDialog = ({ resolve }) => {
  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Orders errors')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Field label={translate('Error message')}>
          {resolve.resource.creation_order.error_message}
        </Field>
        <Field label={translate('Error traceback')} valueClass="text-pre">
          {resolve.resource.creation_order.error_traceback}
        </Field>
      </Modal.Body>
    </>
  );
};
