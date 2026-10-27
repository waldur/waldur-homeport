import { FC } from 'react';
import { Card } from 'react-bootstrap';
import {
  adminArrowCustomerMappingsLinkResource,
  LicenseSuggestion,
} from 'waldur-js-client';

import { Badge, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { SimpleTable } from '@/table/SimpleTable';

import { arrowQueryKeys } from '../api';

interface SuggestedMatchesProps {
  mappingUuid: string;
  suggestions: LicenseSuggestion[];
}

interface LinkResourceVariables {
  resourceUuid: string;
  licenseReference: string;
}

export const SuggestedMatches: FC<SuggestedMatchesProps> = ({
  mappingUuid,
  suggestions,
}) => {
  const linkResourceMutation = useManagedMutation<
    any,
    any,
    LinkResourceVariables
  >({
    mutationFn: (variables) =>
      adminArrowCustomerMappingsLinkResource({
        path: { uuid: mappingUuid },
        body: {
          resource_uuid: variables.resourceUuid,
          license_reference: variables.licenseReference,
        },
      }),
    successMessage: translate('Resource linked to Arrow license'),
    errorMessage: translate('Failed to link resource'),
    invalidateQueries: [
      {
        queryKey: [
          ...arrowQueryKeys.customerBillingSummary(mappingUuid),
          'discover',
        ],
      },
      {
        queryKey: [
          ...arrowQueryKeys.customerBillingSummary(mappingUuid),
          'arrow',
        ],
      },
    ],
    closeModal: false,
  });

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          {translate('Suggested Matches')}
          <Badge variant="primary" className="ms-1.5">
            {suggestions.length}
          </Badge>
        </h5>
      </Card.Header>
      <Card.Body className="p-0">
        <SimpleTable<LicenseSuggestion>
          columns={[
            {
              title: translate('Waldur Resource'),
              render: ({ row }) => <strong>{row.resource_name}</strong>,
            },
            {
              title: translate('Arrow License'),
              render: ({ row }) => (
                <>
                  {row.license_reference}
                  {row.license_name && (
                    <div className="text-quaternary small">
                      {row.license_name}
                    </div>
                  )}
                </>
              ),
            },
            {
              title: translate('Confidence'),
              render: ({ row }) => (
                <Badge
                  variant={
                    row.confidence >= 0.8
                      ? 'success'
                      : row.confidence >= 0.5
                        ? 'warning'
                        : 'secondary'
                  }
                >
                  {Math.round(row.confidence * 100)}%
                </Badge>
              ),
            },
            {
              // Linking is what the list is for, so it stays a button on
              // each row rather than a row action behind a menu.
              title: translate('Action'),
              className: 'text-end',
              headerClassName: 'text-end',
              render: ({ row }) => (
                <BaseButton
                  onClick={() =>
                    linkResourceMutation.mutate({
                      resourceUuid: row.resource_uuid,
                      licenseReference: row.license_reference,
                    })
                  }
                  label={translate('Link')}
                  variant="success"
                  pending={linkResourceMutation.isPending}
                  size="lg"
                />
              ),
            },
          ]}
          rows={suggestions}
          rowKey="license_reference"
        />
      </Card.Body>
    </Card>
  );
};
