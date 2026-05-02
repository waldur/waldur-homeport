import { CaretLeftIcon, ListIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { isDirty } from 'redux-form';

import { getIconUrl } from '@/core/api';
import { GRID_BREAKPOINTS } from '@/core/constants';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { hasSupport as hasSupportSelector } from '@/issues/hooks';
import { ORDER_FORM_ID } from '@/marketplace/details/constants';
import { useModal } from '@/modal/actions';
import { RootState } from '@/store/reducers';
import { useUser } from '@/workspace/hooks';

import { BreadcrumbMain } from './breadcrumb/BreadcrumbMain';
import { ConfirmationDrawerToggle } from './ConfirmationDrawerToggle';
import { LLMChatDrawerToggle } from './LLMChatDrawerToggle';
import { QuickIssueDrawerToggle } from './QuickIssueDrawerToggle';
import { SearchToggle } from './search/SearchToggle';
import { UserDropdownMenu } from './UserDropdown';

const AsideMobileToggle: FunctionComponent = () => (
  <button
    className="btn-nav-item me-1"
    id="kt_aside_mobile_toggle"
    type="button"
  >
    <span className="svg-icon svg-icon-1x">
      <ListIcon weight="bold" />
    </span>
  </button>
);

interface AppHeaderProps {
  hasBreadcrumbs?: boolean;
}

export const AppHeader: FunctionComponent<AppHeaderProps> = ({
  hasBreadcrumbs,
}) => {
  const { confirm } = useModal();
  const {
    state: { name: stateName },
  } = useCurrentStateAndParams();
  const user = useUser();
  const imageUrl = getIconUrl('sidebar_logo_mobile');
  const [errorImg, setErrorImg] = useState(false);

  const hasSupport = useSelector(hasSupportSelector);
  const isOrderFormDirty = useSelector((state: RootState) =>
    isDirty(ORDER_FORM_ID)(state),
  );

  const isSmallScr = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.lg });
  const isResourceCreationView = stateName === 'marketplace-offering-public';

  const onGoBack = async () => {
    if (isOrderFormDirty) {
      try {
        await confirm(
          translate('Unsaved changes'),
          translate(
            'You have unsaved changes. If you leave this page, your changes will be lost.',
          ),
          {
            size: 'sm',
            positiveButtonVariant: 'warning',
            positiveButton: translate('Leave page'),
            negativeButton: translate('Stay'),
          },
        );
      } catch {
        return;
      }
    }

    window.history.back();
  };

  return (
    <div className="header align-items-stretch">
      <div className="container-fluid d-flex align-items-stretch justify-content-between">
        <div className="d-flex align-items-center d-lg-none ms-n2 me-2">
          {Boolean(user) && <AsideMobileToggle />}

          {!errorImg && (
            <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
              <Link
                state={user ? 'profile.details' : null}
                className="d-lg-none text-dark"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Logo"
                    onError={() => setErrorImg(true)}
                    className="h-30px"
                  />
                ) : null}
              </Link>
            </div>
          )}
        </div>
        <div className="d-flex align-items-stretch justify-content-between flex-grow-1">
          <div className="d-flex align-items-stretch justify-content-between flex-grow-1 flex-shrink-1">
            {Boolean(user) && isResourceCreationView && (
              <button
                className="btn me-3 py-0 d-inline-flex align-items-center justify-content-center align-self-center gap-1 text-primary fw-semibold fs-5 border-0 bg-transparent"
                type="button"
                onClick={onGoBack}
                title={translate('Go back')}
                style={{ width: '108px', height: '36px' }}
              >
                <CaretLeftIcon size={18} weight="bold" />
                <span>{translate('Go back')}</span>
              </button>
            )}
            {hasBreadcrumbs && <BreadcrumbMain />}
          </div>
          <div className="d-flex align-items-stretch flex-shrink-0">
            {Boolean(user) && (
              <SearchToggle compact={Boolean(hasBreadcrumbs || isSmallScr)} />
            )}
            {Boolean(user) && hasSupport && <QuickIssueDrawerToggle />}
            {Boolean(user) && <ConfirmationDrawerToggle />}
            {Boolean(user) && <LLMChatDrawerToggle />}
            {Boolean(user) && isSmallScr && (
              <span className="h-40px border-end align-self-center ms-1" />
            )}
            <div className="d-flex align-items-center ms-3">
              <UserDropdownMenu />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
