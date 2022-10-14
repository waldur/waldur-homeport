import { UISref, UISrefActive } from '@uirouter/react';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import Gravatar from 'react-gravatar';
import { useDispatch, useSelector } from 'react-redux';

import { AuthService } from '@waldur/auth/AuthService';
import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { useLanguageSelector } from '@waldur/i18n/useLanguageSelector';
import { showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';
import { getPrivateUserTabs } from '@waldur/user/constants';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { updateThemeMode } from './store';

const getSidebarItems = () =>
  getPrivateUserTabs().filter((item) => item && isFeatureVisible(item.feature));

const LanguageCountry = {
  en: 'us',
  et: 'ee',
};

const LanguageSelector: FunctionComponent = () => {
  const { currentLanguage, languageChoices, setLanguage } =
    useLanguageSelector();

  return (
    <>
      <div
        className="menu-item px-5"
        data-kt-menu-trigger="hover"
        data-kt-menu-placement="left-start"
        data-kt-menu-flip="bottom"
      >
        <a href="#" className="menu-link px-5">
          <span className="menu-title position-relative">
            {translate('Language')}
            <span className="fs-8 rounded bg-light px-3 py-2 position-absolute translate-middle-y top-50 end-0">
              {currentLanguage.label}{' '}
              <i className="f16">
                <i
                  className={`flag ${LanguageCountry[currentLanguage.code]}`}
                ></i>
              </i>
            </span>
          </span>
        </a>

        <div className="menu-sub menu-sub-dropdown w-175px py-4">
          {languageChoices.map((language) => (
            <div
              className="menu-item px-3"
              key={language.code}
              data-kt-menu-trigger="click"
              onClick={() => {
                setLanguage(language);
              }}
            >
              <a
                className={classNames('menu-link d-flex px-5', {
                  active: language.code === currentLanguage.code,
                })}
              >
                <span className="symbol symbol-20px me-4">
                  <i className="f16">
                    <i className={`flag ${LanguageCountry[language.code]}`}></i>
                  </i>
                </span>
                {language.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const DarkLightMode: FunctionComponent = () => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  const handleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('themeMode', newTheme);
    dispatch(updateThemeMode(newTheme));
  };

  return (
    <div className="menu-item px-5" data-kt-menu-trigger="click">
      <div className="px-5 menu-link">
        <AwesomeCheckbox
          label={translate('Dark theme')}
          value={theme === 'dark'}
          onChange={handleTheme}
        />
      </div>
    </div>
  );
};

const UserToken = ({ token }) => {
  const dispatch = useDispatch();

  const onClick = useCallback(() => {
    copy(token);
    dispatch(showSuccess(translate('Token has been copied')));
  }, [dispatch, token]);

  return (
    <div className="menu-item px-5" data-kt-menu-trigger="click">
      <div className="px-5 menu-link">
        <span className="menu-title me-2 text-nowrap">
          {translate('API token')}
        </span>
        <InputGroup>
          <FormControl
            value={token}
            readOnly={true}
            type="password"
            className="form-control-solid"
            size="sm"
            placeholder={translate('Token')}
          />
          <Button
            variant="primary"
            size="sm"
            className="px-3"
            onClick={onClick}
          >
            <i className="fa fa-copy" />
            {translate('Copy')}
          </Button>
        </InputGroup>
      </div>
    </div>
  );
};

export const UserDropdownMenu: FunctionComponent = () => {
  const user = useSelector(getUser) as UserDetails;
  const items = useMemo(getSidebarItems, []);
  return (
    <>
      <div
        className="btn btn-active-light d-flex align-items-center bg-hover-light py-2 px-2 px-md-3"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
        data-kt-menu-flip="bottom"
      >
        <div className="d-none d-md-flex flex-column align-items-end justify-content-center me-2">
          <span className="text-muted fs-7 fw-semibold lh-1 mb-2">
            {translate('Hello')}
          </span>
          <span className="text-dark fs-base fw-bold lh-1">
            {user ? user.first_name : translate('Guest')}
          </span>
        </div>
        <div className="cursor-pointer symbol symbol-30px symbol-md-40px">
          {!user ? (
            <ImagePlaceholder width="40px" height="40px" />
          ) : user.image ? (
            <div
              className="symbol-label"
              style={{ backgroundImage: `url(${user.image})` }}
            />
          ) : (
            <Gravatar email={user.email} size={40} />
          )}
        </div>
      </div>
      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px"
        data-kt-menu="true"
        data-popper-placement="bottom-end"
      >
        <div className="menu-item px-3">
          <div className="menu-content d-flex align-items-center px-3">
            <div className="symbol symbol-50px me-5">
              {!user ? (
                <ImagePlaceholder width="40px" height="40px" />
              ) : user.image ? (
                <div
                  className="symbol-label"
                  style={{ backgroundImage: `url(${user.image})` }}
                />
              ) : (
                <Gravatar email={user.email} size={40} />
              )}
            </div>

            <div className="d-flex flex-column">
              <div className="fw-bolder d-flex align-items-center fs-5">
                {user ? user.full_name : translate('Guest')}
              </div>
              {user ? (
                <Link
                  state="profile.details"
                  className="fw-bold text-muted text-hover-primary fs-7"
                >
                  {user.email}
                </Link>
              ) : (
                <span className="fw-bold text-muted fs-7">
                  {translate('Not signed in')}
                </span>
              )}
            </div>
          </div>
        </div>

        {user ? (
          items.map((item, index) => (
            <UISrefActive class="showing" key={index}>
              <div className="menu-item px-5" data-kt-menu-trigger="click">
                <UISref to={item.state}>
                  <a className="menu-link px-5">{item.label}</a>
                </UISref>
              </div>
            </UISrefActive>
          ))
        ) : (
          <div className="d-grid gap-2 px-6">
            <Link
              state="login"
              className="btn btn-light btn-color-dark btn-active-color-dark"
            >
              {translate('Sign in')}
            </Link>
          </div>
        )}

        <div className="separator my-2"></div>

        <LanguageSelector />

        {user && (
          <div className="menu-item px-5" data-kt-menu-trigger="click">
            <a onClick={AuthService.logout} className="menu-link px-5">
              {translate('Log out')}
            </a>
          </div>
        )}

        <div className="separator my-2"></div>
        <DarkLightMode />

        {user && (
          <>
            <div className="separator my-2"></div>
            <UserToken token={user.token} />
          </>
        )}
      </div>
    </>
  );
};
