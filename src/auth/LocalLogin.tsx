import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

import './LocalLogin.css';

import { SigninForm } from './SigninForm';

const Border = () => (
  <div
    className="LoginSeparatorBorder"
    style={{
      borderBottomColor: ENV.plugins.WALDUR_CORE.BRAND_COLOR,
    }}
  />
);

export const LocalLogin = () => (
  <>
    <SigninForm />
    <div className="LoginSeparator">
      <Border />
      <div className="LoginSeparatorText">{translate('OR')}</div>
      <Border />
    </div>
  </>
);
