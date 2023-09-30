import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { translate } from '@waldur/i18n';
import { getCustomerPermission } from '@waldur/permissions/utils';
import { formatUserStatus } from '@waldur/user/support/utils';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { ContextSelectorDropdown } from './ContextSelectorDropdown';
import { GuestDropdown } from './GuestDropdown';
import { getItemAbbreviation } from './utils';

export const ContextSelectorToggle: FunctionComponent = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const permission = getCustomerPermission(user, customer);

  const abbreviation = useMemo(() => getItemAbbreviation(customer), [customer]);

  return (
    <div
      className="aside-toolbar flex-column-auto overflow-hidden"
      id="kt_aside_toolbar"
    >
      <div
        className="d-flex align-items-center justify-content-center py-5 context-selector-toggle"
        data-kt-menu-trigger="click"
        data-kt-menu-attach=".aside-toolbar"
        data-kt-menu-placement="right-start"
        data-kt-menu-flip="bottom"
      >
        <div className="symbol symbol-50px">
          {customer?.image ? (
            <Image src={customer.image} size={50} />
          ) : (
            <ImagePlaceholder width="50px" height="50px">
              {abbreviation && (
                <div className="symbol-label fs-6 fw-bold">{abbreviation}</div>
              )}
            </ImagePlaceholder>
          )}
        </div>
        <div className="flex-row-fluid flex-wrap ms-5">
          <div className="d-flex">
            <div className="flex-grow-1 me-2 ellipsis">
              {user ? (
                <>
                  <span className="text-white fs-6 fw-bold text-nowrap">
                    {customer
                      ? customer.name || customer.display_name
                      : translate('Select organization')}
                  </span>
                  {customer?.abbreviation && (
                    <span className="text-gray-600 fw-semibold d-block fs-7 mb-1">
                      {customer.abbreviation}
                    </span>
                  )}
                  <div className="d-flex align-items-center text-success fs-8">
                    {permission
                      ? permission.role_description
                      : formatUserStatus(user)}
                  </div>
                </>
              ) : (
                <span className="text-gray-600 fs-6 fw-bold">
                  {translate('Guest')}
                </span>
              )}
            </div>
            <div className="d-flex align-items-center">
              <i className="fa fa-angle-right display-5 fw-light"></i>
            </div>
          </div>
        </div>
      </div>
      {user ? <ContextSelectorDropdown /> : <GuestDropdown />}
    </div>
  );
};
