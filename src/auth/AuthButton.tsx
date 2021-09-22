import React from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';

export interface AuthButtonProps {
  providerKey: string;
  btnClass: string;
  iconClass: string;
  label: string;
  onClick(dispatch: Dispatch): void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  btnClass,
  iconClass,
  label,
  onClick,
}) => {
  const dispatch = useDispatch();
  return (
    <div className="m-b-sm">
      <button
        onClick={() => onClick(dispatch)}
        className={`btn ${btnClass} btn-block text-center`}
      >
        <i className={`fa ${iconClass}`} aria-hidden="true" /> {label}
      </button>
    </div>
  );
};
