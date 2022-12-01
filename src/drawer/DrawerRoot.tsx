import { ErrorBoundary } from '@sentry/react';
import React, { FunctionComponent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { isDirty } from 'redux-form';

import { ErrorMessage } from '@waldur/ErrorMessage';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { closeDrawerDialog } from './actions';

interface TState {
  drawerComponent: React.ComponentType;
  drawerProps: any;
}

export const DrawerRoot: FunctionComponent = () => {
  const { drawerComponent, drawerProps } = useSelector<
    {
      drawer: TState;
    },
    TState
  >((state: RootState) => state.drawer);
  const componentProps = drawerProps?.props || {};
  const dispatch = useDispatch();
  const isDirtyForm = useSelector((state: RootState) =>
    drawerProps?.formId ? isDirty(drawerProps.formId)(state) : false,
  );
  const onHide = () => {
    if (
      isDirtyForm &&
      !confirm(
        translate(
          'You have entered data in form. When drawer is closed form data would be lost.',
        ),
      )
    ) {
      return;
    }
    dispatch(closeDrawerDialog());
  };

  return (
    <div
      id="kt_drawer"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="drawer"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'600px', 'lg': '900px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#kt_drawer_toggle"
      data-kt-drawer-close="#kt_drawer_close"
    >
      <div className="card shadow-none rounded-0 w-100">
        <div className="card-header" id="kt_drawer_header">
          <h3 className="card-title fw-bolder text-dark">
            {drawerProps.title}
          </h3>

          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              onClick={onHide}
            >
              <i className="fa fa-times" />
            </button>
          </div>
        </div>
        <div className="card-body position-relative p-0" id="kt_drawer_body">
          <div
            id="kt_drawer_scroll"
            className="position-relative scroll-y me-n5 pe-5"
            data-kt-scroll="true"
            data-kt-scroll-height="auto"
            data-kt-scroll-wrappers="#kt_drawer_body"
            data-kt-scroll-dependencies="#kt_drawer_header, #kt_drawer_footer"
            data-kt-scroll-offset="5px"
          >
            <div className="p-9">
              <ErrorBoundary fallback={ErrorMessage}>
                {drawerComponent
                  ? React.createElement(drawerComponent, {
                      ...componentProps,
                      close: onHide,
                    })
                  : null}
              </ErrorBoundary>
            </div>
          </div>
        </div>
        {drawerProps.drawerFooter && (
          <div className="card-footer py-5 text-center" id="kt_drawer_footer">
            {drawerProps.drawerFooter}
          </div>
        )}
      </div>
    </div>
  );
};
