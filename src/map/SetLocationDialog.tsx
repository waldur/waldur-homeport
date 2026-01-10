import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { FormFooter } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { LocationContainer } from '@waldur/map/LocationContainer';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import './SetLocationDialog.scss';
import { GeolocationPoint } from './types';

interface SetLocationDialogProps {
  resolve: {
    location: GeolocationPoint;
    setLocationFn(formData: GeolocationPoint): void;
    label: string;
  };
}

export const SetLocationDialog: FunctionComponent<SetLocationDialogProps> =
  connect<{}, {}, SetLocationDialogProps>((_, props) => ({
    initialValues: {
      location: props.resolve.location,
    },
  }))(
    reduxForm<{ location: GeolocationPoint }, SetLocationDialogProps>({
      form: 'LocationEditor',
    })(({ submitting, handleSubmit, invalid, resolve }) => {
      const updateLocationHandler = ({ location }) => {
        resolve.setLocationFn(location);
      };
      return (
        <form onSubmit={handleSubmit(updateLocationHandler)}>
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
      );
    }),
  );
