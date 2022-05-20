import { UISref, UISrefActive } from '@uirouter/react';
import classNames from 'classnames';
import { FunctionComponent, useMemo } from 'react';
import Gravatar from 'react-gravatar';
import { useDispatch, useSelector } from 'react-redux';

import { AuthService } from '@waldur/auth/AuthService';
import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { useLanguageSelector } from '@waldur/i18n/useLanguageSelector';
import { RootState } from '@waldur/store/reducers';
import { getPrivateUserTabs } from '@waldur/user/constants';
import { getUser } from '@waldur/workspace/selectors';

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
              onClick={() => {
                setLanguage(language);
              }}
            >
              <a
                href="#"
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

export const UserDropdownMenu: FunctionComponent = () => {
  const user = useSelector(getUser);
  const items = useMemo(getSidebarItems, []);
  return (
    <>
      <div
        className="cursor-pointer symbol symbol-30px symbol-md-40px"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
        data-kt-menu-flip="bottom"
      >
        <Gravatar email={user.email} size={40} />
      </div>
      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px"
        data-kt-menu="true"
        data-popper-placement="bottom-end"
      >
        <div className="menu-item px-3">
          <div className="menu-content d-flex align-items-center px-3">
            <div className="symbol symbol-50px me-5">
              <Gravatar email={user.email} size={40} />
            </div>

            <div className="d-flex flex-column">
              <div className="fw-bolder d-flex align-items-center fs-5">
                {user.full_name}
              </div>
              <Link
                state="profile.details"
                className="fw-bold text-muted text-hover-primary fs-7"
              >
                {user.email}
              </Link>
            </div>
          </div>
        </div>

        {items.map((item, index) => (
          <UISrefActive class="showing" key={index}>
            <div className="menu-item px-5" data-kt-menu-trigger="click">
              <UISref to={item.state}>
                <a className="menu-link px-5">{item.label}</a>
              </UISref>
            </div>
          </UISrefActive>
        ))}

        <div className="separator my-2"></div>

        <LanguageSelector />

        <div className="menu-item px-5">
          <a onClick={AuthService.logout} className="menu-link px-5">
            {translate('Log out')}
          </a>
        </div>

        <div className="separator my-2"></div>
        <DarkLightMode />
      </div>
    </>
  );
};
