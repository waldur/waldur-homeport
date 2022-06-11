const ButtonHeight = { height: '35px' };

export const ActionButtonSmall = ({
  action,
  title,
  children,
  disable = false,
  className = 'bg-white',
}) => {
  return (
    <button
      className={'btn btn-sm align-items-center d-flex ' + className}
      onClick={action}
      style={ButtonHeight}
      disabled={disable}
    >
      {children}
      {title}
    </button>
  );
};
