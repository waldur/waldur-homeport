import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';
import {
  adminArrowCustomerMappingsLinkResource,
  LicenseSuggestion,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

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
          <Badge bg="primary" className="ms-2">
            {suggestions.length}
          </Badge>
        </h5>
      </Card.Header>
      <Card.Body className="p-0">
        <Table className="mb-0" size="sm" hover>
          <thead>
            <tr>
              <th>{translate('Waldur Resource')}</th>
              <th>{translate('Arrow License')}</th>
              <th>{translate('Confidence')}</th>
              <th className="text-end">{translate('Action')}</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((suggestion, idx) => (
              <tr key={idx}>
                <td>
                  <strong>{suggestion.resource_name}</strong>
                </td>
                <td>
                  <span className="small">{suggestion.license_reference}</span>
                  {suggestion.license_name && (
                    <div className="text-muted small">
                      {suggestion.license_name}
                    </div>
                  )}
                </td>
                <td>
                  <Badge
                    bg={
                      suggestion.confidence >= 0.8
                        ? 'success'
                        : suggestion.confidence >= 0.5
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                </td>
                <td className="text-end">
                  <ActionButton
                    action={() =>
                      linkResourceMutation.mutate({
                        resourceUuid: suggestion.resource_uuid,
                        licenseReference: suggestion.license_reference,
                      })
                    }
                    title={translate('Link')}
                    variant="success"
                    pending={linkResourceMutation.isPending}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
