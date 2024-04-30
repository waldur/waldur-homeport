import { FC, PropsWithChildren } from 'react';

interface OwnProps {
  className?: string;
}

export const PublicOfferingCardTitle: FC<PropsWithChildren<OwnProps>> = ({
  className = 'mb-8',
  children,
}) => <h3 className={className}>{children}</h3>;
