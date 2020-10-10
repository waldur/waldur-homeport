import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Table from 'react-bootstrap/lib/Table';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import {
  Field,
  FieldArray,
  reduxForm,
  WrappedFieldArrayProps,
} from 'redux-form';

import { post } from '@waldur/core/api';
import { SubmitButton } from '@waldur/form';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showError, showSuccess } from '@waldur/store/coreSaga';

interface StaticRoute {
  destination: string;
  nexthop: string;
}

interface OwnProps {
  resolve: {
    router: {
      uuid: string;
      routes: StaticRoute[];
    };
  };
}

interface FormData {
  routes: StaticRoute[];
}

const StaticRouteRow = ({ route, onRemove }) => (
  <tr>
    <td>
      <Field name={`${route}.destination`} component={InputField} />
    </td>
    <td>
      <Field name={`${route}.nexthop`} component={InputField} />
    </td>
    <td>
      <Button bsStyle="default" onClick={onRemove}>
        <i className="fa fa-trash" /> {translate('Remove')}
      </Button>
    </td>
  </tr>
);

const StaticRouteAddButton = ({ onClick }) => (
  <Button bsStyle="default" onClick={onClick}>
    <i className="fa fa-plus" /> {translate('Add route')}
  </Button>
);

const StaticRoutesTable: React.FC<WrappedFieldArrayProps> = ({ fields }) => (
  <>
    {fields.length > 0 ? (
      <>
        <Table
          responsive={true}
          bordered={true}
          striped={true}
          className="m-t-md"
        >
          <thead>
            <tr>
              <th>{translate('Destination (CIDR)')}</th>
              <th>{translate('Next hop (IP)')}</th>
              <th>{translate('Actions')}</th>
            </tr>
          </thead>

          <tbody>
            {fields.map((route, index) => (
              <StaticRouteRow
                key={route}
                route={route}
                onRemove={() => fields.remove(index)}
              />
            ))}
          </tbody>
        </Table>
        <StaticRouteAddButton onClick={() => fields.push({})} />
      </>
    ) : (
      <StaticRouteAddButton onClick={() => fields.push({})} />
    )}
  </>
);

const enhance = compose(
  reduxForm<FormData, OwnProps>({
    form: 'SetRoutesDialog',
  }),
  connect<{}, {}, OwnProps>((_, ownProps) => ({
    initialValues: { routes: ownProps.resolve.router.routes },
  })),
);

export const SetRoutesDialog = enhance(
  ({ resolve, invalid, submitting, handleSubmit }) => {
    const dispatch = useDispatch();
    const setRoutes = async (formData: FormData) => {
      try {
        await post(`/openstack-routers/${resolve.router.uuid}/set_routes/`, {
          routes: formData.routes,
        });
        dispatch(showSuccess(translate('Static routes update was scheduled.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showError(translate('Unable to update static routes.')));
      }
    };

    return (
      <form onSubmit={handleSubmit(setRoutes)} className="form-horizontal">
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
          <FieldArray name="routes" component={StaticRoutesTable} />
        </ModalDialog>
      </form>
    );
  },
);
