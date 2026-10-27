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
    <div
      className={classNames(
        'mb-3',
        topSeparator && 'pt-4 border-t-[1px] border-t-secondary',
      )}
    >
      <div className="mb-4">
        <h6 className="text-secondary">{title}</h6>
        {subtitle && <p className="text-quaternary">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};
