import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateProviderOfferingAttributes } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { formatAttribute } from '../../store/utils';
import { parseAttribute } from '../utils';

import { AttributeCell } from './AttributeCell';
import { ATTRIBUTE_FORM_ID } from './constants';
import { EditAttributeDialogProps } from './types';

type OwnProps = {
  resolve: EditAttributeDialogProps;
};

interface FormData {
  value: any;
}

export const EditAttributeDialog = connect<{}, {}, OwnProps>((_, ownProps) => ({
  initialValues: {
    value: parseAttribute(ownProps.resolve.attribute, ownProps.resolve.value),
  },
}))(
  reduxForm<FormData, OwnProps>({
    form: ATTRIBUTE_FORM_ID,
  })(({ resolve, handleSubmit, invalid, submitting }) => {
    const dispatch = useDispatch();

    const submitRequest = async (formData: FormData) => {
      try {
        await updateProviderOfferingAttributes(resolve.offering.uuid, {
          ...resolve.offering.attributes,
          [resolve.attribute.key]: formatAttribute(
            resolve.attribute,
            formData.value,
          ),
        });
        if (resolve.refetch) {
          await resolve.refetch();
        }
        dispatch(showSuccess(translate('Attribute has been updated.')));
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to update attribute')),
        );
      }
    };

    return (
      <form onSubmit={handleSubmit(submitRequest)}>
        <Modal.Header>
          <Modal.Title>{translate('Edit attribute')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>{translate('Section')}:</strong> {resolve.section.title}
          </p>
          <p>
            <strong>{translate('Attribute')}:</strong> {resolve.attribute.title}
          </p>
          <p>
            <AttributeCell attribute={resolve.attribute} />
          </p>
        </Modal.Body>
        <Modal.Footer>
          <CloseDialogButton />
          <SubmitButton
            disabled={invalid}
            submitting={submitting}
            label={translate('Save')}
          />
        </Modal.Footer>
      </form>
    );
  }),
);
