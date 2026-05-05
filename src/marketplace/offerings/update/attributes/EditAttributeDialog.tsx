import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsUpdateAttributes } from 'waldur-js-client';

import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { formatAttribute } from '../../store/utils';
import { parseAttribute } from '../utils';

import { AttributeCell } from './AttributeCell';
import { EditAttributeDialogProps } from './types';

interface EditAttributeDialogWrapperProps {
  resolve: EditAttributeDialogProps;
}

export const EditAttributeDialog: FC<EditAttributeDialogWrapperProps> = ({
  resolve,
}) => {
  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateAttributes({
        path: { uuid: resolve.offering.uuid },
        body: {
          ...resolve.offering.attributes,
          [resolve.attribute.key]: formatAttribute(
            resolve.attribute,
            formData.value,
          ),
        },
      }),
    successMessage: translate('Attribute has been updated.'),
    errorMessage: translate('Unable to update attribute'),
    refetch: resolve.refetch,
  });

  const initialValues = useMemo(
    () => ({
      value: parseAttribute(resolve.attribute, resolve.value),
    }),
    [resolve.attribute, resolve.value],
  );

  return (
    <Form
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit attribute')}
            footer={
              <FormFooter
                submitting={submitting}
                invalid={invalid}
                submitLabel={translate('Save')}
              />
            }
          >
            <p>
              <strong>{translate('Section')}:</strong> {resolve.section.title}
            </p>
            <p>
              <strong>{translate('Attribute')}:</strong>{' '}
              {resolve.attribute.title}
            </p>
            <p className="mt-5">
              <AttributeCell attribute={resolve.attribute} />
            </p>
          </ModalDialog>
        </form>
      )}
    />
  );
};
