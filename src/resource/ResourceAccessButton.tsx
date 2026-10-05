import {
  ArrowSquareOutIcon,
  CaretDownIcon,
  CopyIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';

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

  const copyText = useCallback((value) => {
    if (isSshFormat(value) && resource.username) {
      const [hostname, port] = value.split('://')[1].split(':');
      const valueToCopy = `ssh ${resource.username}@${hostname}${
        port ? ` -p ${port}` : ''
      }`;

      navigator.clipboard.writeText(valueToCopy).then(() => {
        showSuccess(translate('Text has been copied'));
      });
    } else {
      navigator.clipboard.writeText(value).then(() => {
        showSuccess(translate('Text has been copied'));
      });
    }
  }, []);

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
      {endpoints.map((endpoint, index) => (
        <Menu.Item
          key={index}
          asChild
          className="d-flex justify-content-between px-5 py-3"
        >
          <a
            href={endpoint.url}
            target="_blank"
            rel="noopener noreferrer"
            // On the link, not the row: the row's classes go through
            // tailwind-merge, which reads `text-anchor` and `text-primary`
            // as two colours and drops `text-anchor`; Slot only joins them.
            className="text-anchor text-primary"
          >
            <span className="d-flex flex-center me-6">
              <span className="svg-icon svg-icon-2 svg-icon-primary me-[12px]">
                <ArrowSquareOutIcon weight="bold" />
              </span>
              {endpoint.name}
            </span>
            <Tooltip
              label={
                isSshFormat(endpoint.url) && resource.username
                  ? extendURLWithUsername(endpoint.url)
                  : endpoint.url
              }
            >
              <BaseButton
                variant="text-primary"
                onClick={(e) => {
                  copyText(endpoint.url);
                  e.preventDefault();
                }}
                iconNode={<CopyIcon weight="bold" />}
                className="h-20px"
                size="sm"
              />
            </Tooltip>
          </a>
        </Menu.Item>
      ))}
    </ActionsMenu>
  );
};
