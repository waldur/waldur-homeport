import { FactoryIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { Project } from 'waldur-js-client';

import { Badge, ButtonVariant, ButtonSize } from 'waldur-ui';

import { Link } from '@/core/Link';
import { AtLeast } from '@/core/types';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { canAccessProjectDashboard } from '@/permissions/canAccessProjectDashboard';
import { useUser } from '@/workspace/hooks';

import { projectKindOptions } from './utils';

interface OwnProps {
  row: AtLeast<Project, 'uuid' | 'name'> & { customer_uuid?: string };
  buttonVariant?: ButtonVariant;
  /** Size and shape of the link when it renders as a button (`buttonVariant`). */
  buttonSize?: ButtonSize;
  buttonIconOnly?: boolean;
  className?: string;
  showIndustry?: boolean;
  showKind?: boolean;
  onClick?(): void;
}

export const ProjectLink: FC<PropsWithChildren<OwnProps>> = ({
  row,
  buttonVariant,
  buttonSize,
  buttonIconOnly,
  className,
  children,
  showIndustry = true,
  showKind,
  onClick,
}) => {
  const user = useUser();
  const canAccess = canAccessProjectDashboard(
    user,
    row.uuid,
    row.customer_uuid,
  );
  const options = projectKindOptions();
  const kind = options[row.kind] || options.default;
  const Icon = kind.icon;
  const labelClassName = classNames(className, !children && 'ellipsis');

  return (
    <div className="d-flex align-items-center gap-1">
      {canAccess ? (
        <Link
          state="project.dashboard"
          params={{
            uuid: row.uuid,
            ...(row.is_removed && { include_terminated: 'true' }),
          }}
          label={children ? undefined : row.name}
          onClick={onClick}
          buttonVariant={buttonVariant}
          buttonSize={buttonSize}
          buttonIconOnly={buttonIconOnly}
          className={labelClassName}
        >
          {children}
        </Link>
      ) : (
        <span className={labelClassName}>{children ?? row.name}</span>
      )}
      {showKind && row.kind !== 'default' && kind && Icon && (
        // eslint-disable-next-line waldur-custom/enforce-badge-icon-patterns
        <Badge
          variant={kind.color}
          shape="pill"
          tone="outline"
          onlyIcon
          tooltip={translate('{name} project', { name: kind.label })}
        >
          {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
          <Icon weight="bold" size={12} />
        </Badge>
      )}
      {showIndustry &&
        isFeatureVisible(ProjectFeatures.show_industry_flag) &&
        row.is_industry && (
          <span className="svg-icon svg-icon-4">
            <FactoryIcon weight="bold" />
          </span>
        )}
      {row.is_removed && (
        <Badge variant="danger" shape="pill" tone="outline" className="fs-8">
          {translate('Removed')}
        </Badge>
      )}
    </div>
  );
};
