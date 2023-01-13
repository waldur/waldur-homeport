import { FC } from 'react';

interface OwnProps {
  className?: string;
}

export const PublicOfferingCardTitle: FC<OwnProps> = (props) => (
  <h3 className={props.className}>{props.children}</h3>
);

PublicOfferingCardTitle.defaultProps = {
  className: 'mb-8',
};
