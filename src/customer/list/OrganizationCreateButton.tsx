import { CaretDownIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n/translate';
import { useModal } from '@waldur/modal/hooks';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

const CustomerCreateDialog = lazyComponent(() =>
  import('@waldur/customer/create/CustomerCreateDialog').then((module) => ({
    default: module.CustomerCreateDialog,
  })),
);

export const OrganizationCreateButton: FunctionComponent = () => {
  const user = useSelector(getUser);
  const { openDialog } = useModal();
  const router = useRouter();
  const showOnboarding = isFeatureVisible(CustomerFeatures.show_onboarding);

  if (!user.is_staff && !showOnboarding) return null;

  if (user.is_staff && showOnboarding) {
    return (
      <Dropdown>
        <Dropdown.Toggle
          variant="primary"
          size="lg"
          className="no-arrow btn-icon-right"
        >
          <span className="svg-icon svg-icon-2">
            <PlusCircleIcon weight="bold" />
          </span>
          {translate('Add')}
          <span className="svg-icon svg-icon-2 rotate-180">
            <CaretDownIcon weight="bold" />
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu flip>
          <ActionItem
            title={translate('Create organisation')}
            action={() =>
              openDialog(CustomerCreateDialog, {
                resolve: { role: 'CUSTOMER' },
              })
            }
          />
          <ActionItem
            title={translate('Onboard organisation')}
            action={() => router.stateService.go('organizations-create')}
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  return (
    <ActionButton
      title={translate('Add')}
      action={() =>
        user.is_staff
          ? openDialog(CustomerCreateDialog, { resolve: { role: 'CUSTOMER' } })
          : router.stateService.go('organizations-create')
      }
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
