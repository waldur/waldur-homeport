import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { FieldArray, reduxForm } from 'redux-form';
import {
  OpenStackRouter,
  openstackRoutersSetRoutes,
  OpenStackStaticRouteRequest,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { StaticRoutesTable } from './StaticRoutesTable';

interface OwnProps {
  resolve: {
    router: OpenStackRouter;
  };
}

interface FormData {
  routes: OpenStackStaticRouteRequest[];
}

const enhance = compose(
  connect<{}, {}, OwnProps>((_, ownProps) => ({
    initialValues: { routes: ownProps.resolve.router.routes },
  })),
  reduxForm<FormData, OwnProps>({
    form: 'SetRoutesDialog',
  }),
);

export const SetRoutesDialog = enhance(
  ({ resolve, invalid, submitting, handleSubmit }) => {
    const dispatch = useDispatch();
    const setRoutes = async (formData: FormData) => {
      try {
        await openstackRoutersSetRoutes({
          path: { uuid: resolve.router.uuid },
          body: {
            routes: formData.routes,
          },
        });
        dispatch(showSuccess(translate('Static routes update was scheduled.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to update static routes.')),
        );
      }
    };

    return (
      <form onSubmit={handleSubmit(setRoutes)}>
        <ModalDialog
          title={translate('Update static routes')}
          footer={
            <>
              <CloseDialogButton />
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Update')}
              />
            </>
          }
        >
          <FieldArray
            name="routes"
            component={StaticRoutesTable}
            fixedIps={resolve.router.fixed_ips}
          />
        </ModalDialog>
      </form>
    );
  },
);
