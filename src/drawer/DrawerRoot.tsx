import { X } from '@phosphor-icons/react';
import { ErrorBoundary } from '@sentry/react';
import React, { FunctionComponent, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { isDirty } from 'redux-form';

import { ErrorMessage } from '@waldur/ErrorMessage';
import { translate } from '@waldur/i18n';
import { DrawerComponent } from '@waldur/metronic/components';
import { RootState } from '@waldur/store/reducers';

import { closeDrawerDialog } from './actions';
import { DrawerStateProps } from './reducer';

export const DrawerRoot: FunctionComponent = () => {
  const { drawerComponent, drawerProps } = useSelector<
    { drawer: DrawerStateProps },
    DrawerStateProps
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
    dispatch(closeDrawerDialog(drawerProps));
  };

  const drawer = DrawerComponent.getInstance('kt_drawer');
  useEffect(() => {
    if (drawer) drawer.update();
  }, [drawerProps, drawer]);

  return (
    <div
      id="kt_drawer"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="drawer"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width={`{default:'100%', 'lg': '${drawerProps.width}'}`}
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#kt_drawer_toggle"
      data-kt-drawer-close="#kt_drawer_close"
    >
      <div className="card shadow-none rounded-0 w-100">
        <div className="card-header" id="kt_drawer_header">
          <div>
            <h3 className="card-title fw-bolder text-dark">
              {drawerProps.title}
            </h3>
            {drawerProps.subtitle && (
              <h6 className="text-muted card-subtitle fw-bold">
                {drawerProps.subtitle}
              </h6>
            )}
          </div>

          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              onClick={onHide}
            >
              <X />
            </button>
          </div>
        </div>
        <div className="card-body scroll-y p-0" id="kt_drawer_body">
          <div className="p-9 pe-4">
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
        {drawerProps.footer && (
          <div className="card-footer py-5 text-center" id="kt_drawer_footer">
            <drawerProps.footer {...componentProps} close={onHide} />
          </div>
        )}
      </div>
    </div>
  );
};
