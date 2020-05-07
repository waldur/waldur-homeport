import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';

interface SubmitButtonProps {
  submitting: boolean;
  invalid?: boolean;
  label?: string;
  bsStyle?: string;
  block?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  submitting,
  invalid,
  label,
  children,
  bsStyle,
  block,
}) => (
  <Button
    type="submit"
    bsStyle={bsStyle}
    block={block}
    disabled={submitting || invalid}
  >
    {submitting && (
      <>
        <i className="fa fa-spinner fa-spin m-r-xs" />{' '}
      </>
    )}
    {label}
    {children}
  </Button>
);

SubmitButton.defaultProps = {
  bsStyle: 'primary',
  block: true,
};
