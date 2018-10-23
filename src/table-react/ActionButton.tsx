import * as React from 'react';

interface Props {
  title: string;
  action: () => void;
  icon: string;
  className?: string;
}

const ActionButton: React.SFC<Props> = ({ title, action, icon, className}: Props) => (
  <button
    type="button"
    className={className}
    onClick={action}>
    <i className={icon}/>&nbsp;
    {title}
  </button>
);

ActionButton.defaultProps = {
  className: 'btn btn-sm btn-default',
};

export default ActionButton;
