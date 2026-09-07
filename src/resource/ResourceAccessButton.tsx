import {
  ArrowSquareOutIcon,
  CaretDownIcon,
  CopyIcon,
} from '@phosphor-icons/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { FC, useCallback, useMemo } from 'react';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { CompactActionButton } from '@/table/CompactActionButton';

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
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>
        <button
          type="button"
          className="btn dropdown-toggle btn-tertiary no-arrow btn-icon-right"
        >
          {translate('Access resource')}
          <span className="svg-icon svg-icon-2 rotate-toggle-180">
            <CaretDownIcon weight="bold" />
          </span>
        </button>
      </RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align="end"
          sideOffset={2}
          className="dropdown-menu show position-static"
        >
          {endpoints.map((endpoint, index) => (
            <RadixDropdownMenu.Item key={index} asChild>
              <a
                href={endpoint.url}
                target="_blank"
                rel="noopener noreferrer"
                className="dropdown-item d-flex justify-content-between text-anchor text-primary px-5 py-3"
              >
                <span className="d-flex flex-center me-6">
                  <span className="svg-icon svg-icon-2 svg-icon-primary">
                    <ArrowSquareOutIcon weight="bold" />
                  </span>
                  {endpoint.name}
                </span>
                <Tip
                  id="resource-endpoint-tooltip"
                  label={
                    isSshFormat(endpoint.url) && resource.username
                      ? extendURLWithUsername(endpoint.url)
                      : endpoint.url
                  }
                >
                  <CompactActionButton
                    variant="link"
                    className="h-20px"
                    action={(e) => {
                      copyText(endpoint.url);
                      e.preventDefault();
                    }}
                    iconNode={<CopyIcon weight="bold" />}
                  />
                </Tip>
              </a>
            </RadixDropdownMenu.Item>
          ))}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
