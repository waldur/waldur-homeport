import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import {
  marketplaceOfferingTemplatesVersionsList,
  OfferingTemplate,
  OfferingTemplateVersion,
} from 'waldur-js-client';

import { Badge, BaseButton, EmptyState } from 'waldur-ui';

import { CodeBlock } from '@/core/CodeBlock';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { SimpleTable } from '@/table/SimpleTable';

interface OfferingTemplateVersionsDialogProps {
  resolve: { template: OfferingTemplate };
}

/** Every document a template has held, newest first, each one readable. */
export const OfferingTemplateVersionsDialog: FC<
  OfferingTemplateVersionsDialogProps
> = ({ resolve: { template } }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['offering-template-versions', template.uuid],
    queryFn: () =>
      marketplaceOfferingTemplatesVersionsList({
        path: { uuid: template.uuid },
      }).then((response) => response.data),
    staleTime: 0,
  });
  // The API lists them oldest first.
  const versions = useMemo(
    () => [...(data ?? [])].sort((a, b) => b.number - a.number),
    [data],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const shown =
    versions.find((version) => version.number === selected) ?? versions[0];

  return (
    <ModalDialog
      iconNode={<ClockCounterClockwiseIcon weight="bold" />}
      iconColor="info"
      title={translate('Version history')}
      subtitle={translate(
        'Each change to the document of {name} is kept as a version. Offerings created from the template keep the version they were created from.',
        { name: template.name },
      )}
      footer={
        <div className="min-w-dialog-action">
          <CloseDialogButton label={translate('Close')} className="w-full" />
        </div>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load the versions of the template.')}
          loadData={refetch}
        />
      ) : !versions.length ? (
        <EmptyState message={translate('The template has no versions yet.')} />
      ) : (
        <>
          <div className="max-h-64 overflow-auto mb-5">
            <SimpleTable<OfferingTemplateVersion>
              rowKey="number"
              rows={versions}
              columns={[
                {
                  title: translate('Version'),
                  rowHeader: true,
                  render: ({ row }) => (
                    <span className="inline-flex gap-1.5 items-center">
                      {row.number}
                      {row.number === template.version ? (
                        <Badge variant="success" size="sm">
                          {translate('Current')}
                        </Badge>
                      ) : null}
                    </span>
                  ),
                },
                {
                  title: translate('Created'),
                  render: ({ row }) => formatDateTime(row.created),
                },
                {
                  title: translate('Document'),
                  render: ({ row }) => (
                    <BaseButton
                      variant="text-primary"
                      size="sm"
                      label={
                        row.number === shown?.number
                          ? translate('Shown below')
                          : translate('Show')
                      }
                      aria-label={translate(
                        'Show the document of version {number}',
                        {
                          number: row.number,
                        },
                      )}
                      aria-pressed={row.number === shown?.number}
                      onClick={() => setSelected(row.number)}
                    />
                  ),
                },
              ]}
            />
          </div>
          {shown ? (
            <section
              aria-label={translate('Document of version {number}', {
                number: shown.number,
              })}
              data-testid="offering-template-version-document"
            >
              <h3 className="text-sm font-medium mb-2.5">
                {translate('Document of version {number}', {
                  number: shown.number,
                })}
              </h3>
              <div className="max-h-96 overflow-auto">
                <CodeBlock copyable>
                  {JSON.stringify(shown.document, null, 2)}
                </CodeBlock>
              </div>
            </section>
          ) : null}
        </>
      )}
    </ModalDialog>
  );
};
