import { connect } from 'react-redux';
import { compose } from 'redux';
import { FieldArray, reduxForm } from 'redux-form';
import {
  OpenStackRouter,
  openstackRoutersSetRoutes,
  OpenStackStaticRouteRequest,
} from 'waldur-js-client';

import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
    const setRoutesMutation = useManagedMutation<any, any, FormData>({
      mutationFn: (formData) =>
        openstackRoutersSetRoutes({
          path: { uuid: resolve.router.uuid },
          body: {
            routes: formData.routes,
          },
        }),
      successMessage: translate('Static routes update was scheduled.'),
      errorMessage: translate('Unable to update static routes.'),
    });

    return (
      <form
        onSubmit={handleSubmit((values) =>
          setRoutesMutation.mutateAsync(values),
        )}
      >
        <ModalDialog
          title={translate('Update static routes')}
          footer={
            <FormFooter
              submitting={submitting}
              invalid={invalid}
              submitLabel={translate('Update')}
            />
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
