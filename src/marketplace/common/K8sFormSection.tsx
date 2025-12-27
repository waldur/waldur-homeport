import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';

interface K8sFormSectionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  topSeparator?: boolean;
}

export const K8sFormSection: FC<PropsWithChildren<K8sFormSectionProps>> = ({
  title,
  subtitle,
  topSeparator,
  children,
}) => {
  return (
    <div className={classNames('mb-4', topSeparator && 'pt-5 border-top')}>
      <div className="mb-5">
        <h6 className="text-secondary">{title}</h6>
        {subtitle && <p className="text-muted">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};
