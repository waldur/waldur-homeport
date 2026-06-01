import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
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

export const SetRoutesDialog = ({ resolve }: OwnProps) => {
  const setRoutesMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      openstackRoutersSetRoutes({
        path: { uuid: resolve.router.uuid },
        body: {
          routes: formData.routes || [],
        },
      }),
    successMessage: translate('Static routes update was scheduled.'),
    errorMessage: translate('Unable to update static routes.'),
  });

  return (
    <Form<FormData>
      onSubmit={(values) => setRoutesMutation.mutateAsync(values)}
      initialValues={{ routes: resolve.router.routes } as any}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update static routes')}
            footer={<FormFooter submitLabel={translate('Update')} />}
          >
            <FieldArray
              name="routes"
              render={({ fields }) => (
                <StaticRoutesTable
                  fields={fields}
                  fixedIps={resolve.router.fixed_ips}
                />
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
