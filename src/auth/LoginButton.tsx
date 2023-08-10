import { translate } from '@waldur/i18n';

import './LoginButton.css';

export const LoginButton = ({
  image,
  iconClass,
  label,
  onClick,
}: {
  image?: React.ReactNode;
  iconClass?: string;
  label: string;
  onClick?(): void;
}) => (
  <button className="LoginButton" onClick={onClick}>
    <div className="LoginButtonIcon">
      {image}
      {iconClass ? (
        <i
          className={`fa ${iconClass}`}
          aria-hidden="true"
          style={{ padding: 8, fontSize: 20 }}
        />
      ) : null}
    </div>
    <div className="LoginButtonText">
      {translate('Sign in with {label}', { label })}
    </div>
  </button>
);
