import { FunctionComponent } from 'react';
import { Form, Field } from 'react-final-form';

import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { LocationContainer } from '@/map/LocationContainer';
import { ModalDialog } from '@/modal/ModalDialog';

import './SetLocationDialog.scss';
import { GeolocationPoint } from './types';

interface SetLocationDialogProps {
  resolve: {
    location: GeolocationPoint;
    setLocationFn(formData: GeolocationPoint): void;
    label: string;
  };
}

export const SetLocationDialog: FunctionComponent<SetLocationDialogProps> = ({
  resolve,
}) => {
  const updateLocationHandler = ({ location }) => {
    resolve.setLocationFn(location);
  };

  return (
    <Form
      initialValues={{ location: resolve.location || {} }}
      onSubmit={updateLocationHandler}
      render={({ submitting, handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              resolve.location
                ? translate('Update location')
                : translate('Set location')
            }
            footer={
              <FormFooter
                submitting={submitting}
                invalid={invalid}
                submitLabel={translate('Save')}
              />
            }
          >
            <Field
              name="location"
              component={LocationContainer}
              label={resolve.label}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
