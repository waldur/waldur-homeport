import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  marketplaceProviderOfferingsTemplateDiffRetrieve,
  OfferingTemplateDifference,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { Code, PropertyItem, PropertyList } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { SimpleTable } from '@/table/SimpleTable';

const renderValue = (value: unknown) =>
  value === null || value === undefined ? (
    <span className="text-tertiary">{translate('Not set')}</span>
  ) : (
    <Code className="text-xs break-words">
      {typeof value === 'string' ? value : JSON.stringify(value)}
    </Code>
  );

const DifferencesTable: FC<{
  differences: OfferingTemplateDifference[];
  testId: string;
}> = ({ differences, testId }) =>
  differences.length ? (
    <div data-testid={testId}>
      <SimpleTable<OfferingTemplateDifference>
        rowKey="path"
        rows={differences}
        columns={[
          {
            title: translate('Field'),
            rowHeader: true,
            render: ({ row }) => (
              <Code className="text-xs break-words">{row.path}</Code>
            ),
          },
          {
            title: translate('Template'),
            className: 'whitespace-normal',
            render: ({ row }) => renderValue(row.template),
          },
          {
            title: translate('Offering'),
            className: 'whitespace-normal',
            render: ({ row }) => renderValue(row.offering),
          },
        ]}
      />
    </div>
  ) : (
    <p className="text-tertiary" data-testid={testId}>
      {translate('No differences.')}
    </p>
  );

/** Which template the offering was created from, and how far it has moved
 * from that version and from the template's latest. */
const TemplatePanel: FC<{ offering: ProviderOfferingDetails }> = ({
  offering,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['offering-template-diff', offering.uuid],
    queryFn: () =>
      marketplaceProviderOfferingsTemplateDiffRetrieve({
        path: { uuid: offering.uuid },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
  });
  return (
    <>
      <PropertyList variant="summary" className="mb-5">
        <PropertyItem
          label={translate('Template')}
          value={offering.template_name}
        />
        <PropertyItem
          label={translate('Created from version')}
          value={offering.template_version}
        />
        {data?.latest_version !== null && data?.latest_version !== undefined ? (
          <PropertyItem
            label={translate('Latest version')}
            value={data.latest_version}
          />
        ) : null}
      </PropertyList>
      {isLoading ? (
        <LoadingSpinner />
      ) : error || !data ? (
        <LoadingErred
          message={translate(
            'Unable to compare the offering with its template.',
          )}
          loadData={refetch}
        />
      ) : (
        <>
          <h3 className="text-base font-semibold mb-2">
            {translate('Changed since it was created')}
          </h3>
          <DifferencesTable
            differences={data.created_version_differences}
            testId="template-drift-created"
          />
          {data.latest_version_differences &&
          data.latest_version !== data.template_version ? (
            <>
              <h3 className="text-base font-semibold mt-5 mb-2">
                {translate('Different from the latest version')}
              </h3>
              <DifferencesTable
                differences={data.latest_version_differences}
                testId="template-drift-latest"
              />
            </>
          ) : null}
        </>
      )}
    </>
  );
};

export interface TemplateDifferencesDialogProps {
  resolve: { offering: ProviderOfferingDetails };
}

export const TemplateDifferencesDialog: FC<TemplateDifferencesDialogProps> = ({
  resolve: { offering },
}) => (
  <ModalDialog
    title={translate('Template differences')}
    subtitle={offering.name}
  >
    <TemplatePanel offering={offering} />
  </ModalDialog>
);
