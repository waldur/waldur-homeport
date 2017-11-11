import React from 'react';

type Props = {
  title: string,
  action: () => void,
  icon: string
};

const ActionButton = ({ title, action, icon }: Props) => (
  <button
    type='button'
    className='btn btn-sm btn-default'
    onClick={action}>
    <i className={icon}/>&nbsp;
    {title}
  </button>
);

export default ActionButton;
