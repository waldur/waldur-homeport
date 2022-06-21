import React from 'react';

interface AddOptionButtonProps {
  onClick(): void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const AddOptionButton = (props: AddOptionButtonProps) => (
  <button
    type="button"
    className="btn btn-secondary"
    onClick={props.onClick}
    disabled={props.disabled}
  >
    <i className="fa fa-plus" /> {props.children}
  </button>
);
