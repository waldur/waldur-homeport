import { FlaskIcon, DatabaseIcon, FunctionIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Badge } from '@waldur/core/Badge';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { DataSourceType } from './types';

interface MockDataIndicatorProps {
  source: DataSourceType;
  description?: string;
  className?: string;
}

const sourceConfig: Record<
  DataSourceType,
  {
    icon: typeof FlaskIcon;
    label: string;
    variant: 'success' | 'warning' | 'primary';
    defaultDescription: string;
  }
> = {
  real: {
    icon: DatabaseIcon,
    label: translate('Real data'),
    variant: 'success',
    defaultDescription: translate('Data fetched from the server'),
  },
  mocked: {
    icon: FlaskIcon,
    label: translate('Mocked data'),
    variant: 'warning',
    defaultDescription: translate(
      'Sample data for demonstration. Backend support pending.',
    ),
  },
  calculated: {
    icon: FunctionIcon,
    label: translate('Calculated'),
    variant: 'primary',
    defaultDescription: translate('Derived from real data through calculation'),
  },
};

/**
 * Visual indicator showing the source of data in analytics views.
 * Helps users understand when they're looking at real vs. mocked data.
 * Only renders for mocked source when experimental UI is enabled.
 */
export const MockDataIndicator: FC<MockDataIndicatorProps> = ({
  source,
  description,
  className,
}) => {
  // Don't show mocked data indicator when experimental UI is disabled
  if (source === 'mocked' && !isExperimentalUiComponentsVisible()) {
    return null;
  }

  const config = sourceConfig[source];

  const renderIcon = () => {
    switch (source) {
      case 'real':
        return <DatabaseIcon weight="bold" />;
      case 'mocked':
        return <FlaskIcon weight="bold" />;
      case 'calculated':
        return <FunctionIcon weight="bold" />;
    }
  };

  return (
    <Tip
      id={`data-source-${source}`}
      label={description || config.defaultDescription}
    >
      <Badge
        variant={config.variant}
        leftIcon={renderIcon()}
        outline
        className={className}
      >
        {config.label}
      </Badge>
    </Tip>
  );
};
