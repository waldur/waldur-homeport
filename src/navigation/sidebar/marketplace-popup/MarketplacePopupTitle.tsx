import { useRouter } from '@uirouter/react';
import { debounce } from 'lodash';
import {
  FunctionComponent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Button, Col } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';
import { Customer } from '@waldur/workspace/types';

export const MarketplacePopupTitle: FunctionComponent<{
  customer: Customer;
  isVisible: boolean;
}> = ({ customer, isVisible }) => {
  const router = useRouter();

  const changeWorkspace = () => {
    router.stateService.go('profile-projects');
    MenuComponent.hideDropdowns(undefined);
  };

  const refTitle = useRef<HTMLInputElement>();
  const [organizationNameLength, setOrganizationNameLength] = useState(0);

  // Truncating the displayed organization name
  const changeOrganizationNameLength = useCallback(
    debounce((length) => {
      setOrganizationNameLength(length);
    }, 16),
    [setOrganizationNameLength],
  );
  useLayoutEffect(() => {
    function checkWidth() {
      if (!isVisible || !refTitle.current) return;
      const wrapperWidth = refTitle.current?.clientWidth;
      const buttonWidth = refTitle.current
        .getElementsByTagName('button')
        .item(0)?.clientWidth;
      if (wrapperWidth <= buttonWidth && organizationNameLength > 0) {
        changeOrganizationNameLength(organizationNameLength - 1);
      } else if (
        wrapperWidth > buttonWidth + 20 &&
        organizationNameLength < customer.name.length
      ) {
        changeOrganizationNameLength(organizationNameLength + 1);
      }
    }
    window.addEventListener('resize', checkWidth);
    checkWidth();
    return () => window.removeEventListener('resize', checkWidth);
  }, [refTitle.current, isVisible, organizationNameLength]);

  return (
    <Col ref={refTitle} xs={5} xl={3} className="text-white fs-7">
      <span className="text-nowrap">
        {translate('Showing services available for')}:{' '}
      </span>
      {customer && (
        <Tip
          id="marketplaces-selector-customer-tip"
          label={customer?.name}
          className="d-block"
        >
          <Button
            variant="link"
            className="btn-color-white btn-active-color-muted fs-7 fw-bolder text-nowrap p-0"
            onClick={changeWorkspace}
          >
            {customer?.name && organizationNameLength > 6
              ? truncate(customer?.name, organizationNameLength)
              : customer?.abbreviation}{' '}
            ({translate('change')})
          </Button>
        </Tip>
      )}
    </Col>
  );
};
