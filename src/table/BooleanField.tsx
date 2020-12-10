import classNames from 'classnames';

interface Props {
  value: boolean;
}

export const BooleanField = ({ value }: Props) => (
  <i
    className={classNames('fa', {
      'fa-check': value,
      'fa-minus': !value,
    })}
  />
);
