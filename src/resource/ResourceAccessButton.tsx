import {
  ArrowSquareOutIcon,
  CaretDownIcon,
  CopyIcon,
} from '@phosphor-icons/react';
import { FC, useMemo } from 'react';

import { BaseButton, Menu, Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { getResourceAccessEndpoints, isSshFormat } from './utils';

interface Endpoint {
  name?: string;
  url?: string;
}
interface ResourceAccessButtonProps {
  resource: {
    endpoints?: Endpoint[];
    username?: string;
  };
  offering: {
    endpoints?: Endpoint[];
  };
}

export const ResourceAccessButton: FC<ResourceAccessButtonProps> = ({
  resource,
  offering,
}) => {
  const { showSuccess } = useNotify();

  const extendURLWithUsername = (url) => {
    const [protocol, restUrl] = url.split('://');
    const [hostname, port] = restUrl.split(':');
    return `${protocol}://${resource.username}${resource.username ? '@' : ''}${
      hostname
    }${port ? `:${port}` : ''}`;
  };

  // An SSH endpoint copies as the command that opens it.
  const getCopyValue = (url: string) => {
    if (isSshFormat(url) && resource.username) {
      const [hostname, port] = url.split('://')[1].split(':');
      return `ssh ${resource.username}@${hostname}${port ? ` -p ${port}` : ''}`;
    }
    return url;
  };

  const endpoints = useMemo(
    () => getResourceAccessEndpoints(resource, offering),
    [resource, offering],
  );

  if (endpoints.length === 0) {
    return null;
  }
  return (
    <ActionsMenu
      side="bottom"
      toggle={
        <BaseButton
          variant="tertiary"
          label={translate('Access resource')}
          iconNode={<CaretDownIcon weight="bold" />}
          iconRight
        />
      }
      align="end"
    >
      {endpoints.map((endpoint, index) => {
        const shownUrl =
          isSshFormat(endpoint.url) && resource.username
            ? extendURLWithUsername(endpoint.url)
            : endpoint.url;
        return (
          // Two menu items side by side, the link and its copy action, so
          // the copy control is not nested inside the link (axe
          // nested-interactive) and arrow keys reach both.
          <div key={index} className="flex items-stretch">
            <Menu.Item asChild className="flex-1 px-5 py-3">
              <a
                href={endpoint.url}
                target="_blank"
                rel="noopener noreferrer"
                // On the link, not the row: the row's classes go through
                // tailwind-merge, which reads `text-anchor` and `text-brand`
                // as two colours and drops `text-anchor`; Slot only joins them.
                className="text-anchor text-brand"
              >
                <span className="flex flex-center">
                  <span className="svg-icon svg-icon-2 svg-icon-primary me-[12px]">
                    <ArrowSquareOutIcon weight="bold" />
                  </span>
                  {endpoint.name}
                </span>
              </a>
            </Menu.Item>
            <Menu.CopyItem
              value={getCopyValue(endpoint.url)}
              onCopied={() => showSuccess(translate('Text has been copied'))}
              className="px-3"
            >
              <Tooltip label={shownUrl}>
                <span className="inline-flex text-[var(--btn-text-primary-color)]">
                  <CopyIcon weight="bold" aria-hidden="true" />
                </span>
              </Tooltip>
              <span className="sr-only">
                {translate('Copy {value}', { value: shownUrl })}
              </span>
            </Menu.CopyItem>
          </div>
        );
      })}
    </ActionsMenu>
  );
};
