import { FC, useMemo } from 'react';
import { ReviewerSuggestion } from 'waldur-js-client';

import {
  Badge,
  PropertyItem,
  PropertyList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

/**
 * Where the suggested reviewer stands in the call's pool, however they got
 * there: from this suggestion or invited directly.
 */
const POOL_STATUS_LABELS: Record<string, () => string> = {
  accepted: () => translate('In the pool'),
  pending: () => translate('Invited to the pool'),
  declined: () => translate('Declined the pool invitation'),
  expired: () => translate('Pool invitation expired'),
};

interface TopMatchingProposal {
  uuid: string;
  name: string;
  slug?: string;
  affinity: number;
  keyword_score?: number;
  text_score?: number;
  has_coi?: boolean;
  coi_type?: string;
  coi_severity?: string;
}

interface SuggestionExpandableRowProps {
  row: ReviewerSuggestion;
}

const formatScore = (score: number | undefined | null) => {
  if (score === undefined || score === null) return '-';
  return `${Math.round(score * 100)}%`;
};

const COIBadge: FC<{ proposal: TopMatchingProposal }> = ({ proposal }) => {
  if (!proposal.has_coi) {
    return (
      <Badge variant="success" shape="pill" tone="outline">
        {translate('No conflict')}
      </Badge>
    );
  }

  const variant = proposal.coi_severity === 'real' ? 'danger' : 'warning';
  return (
    <Badge variant={variant} shape="pill" tone="outline">
      {proposal.coi_type || translate('Conflict')}
    </Badge>
  );
};

export const SuggestionExpandableRow: FC<SuggestionExpandableRowProps> = ({
  row,
}) => {
  const topProposals = useMemo(() => {
    const proposals = (row.top_matching_proposals ||
      []) as TopMatchingProposal[];
    return proposals;
  }, [row.top_matching_proposals]);

  const matchedKeywords = useMemo(() => {
    return (row.matched_keywords || []) as string[];
  }, [row.matched_keywords]);

  // What the row's cells leave out, as key/value rows.
  const details = (
    <PropertyList variant="summary">
      {row.reviewer_biography && (
        <PropertyItem
          label={translate('Biography')}
          value={row.reviewer_biography}
        />
      )}
      {row.pool_invitation_status && (
        <PropertyItem
          label={translate('Pool')}
          value={
            POOL_STATUS_LABELS[row.pool_invitation_status]?.() ??
            row.pool_invitation_status
          }
        />
      )}
      {row.reviewed_at && (
        <PropertyItem
          label={translate('Reviewed')}
          value={propVal.date(row.reviewed_at)}
        />
      )}
      {row.rejection_reason && (
        <PropertyItem
          label={translate('Rejection reason')}
          value={row.rejection_reason}
        />
      )}
    </PropertyList>
  );

  if (topProposals.length === 0 && matchedKeywords.length === 0) {
    return (
      <ExpandableContainer>
        {details}
        <p className="text-quaternary mb-0 mt-1.5">
          {translate('No detailed match information available.')}
        </p>
      </ExpandableContainer>
    );
  }

  return (
    <ExpandableContainer>
      <div className="mb-3">{details}</div>
      {/* Matched Keywords Section */}
      {matchedKeywords.length > 0 && (
        <div className="mb-3">
          <h6 className="font-medium mb-2.5">
            {translate('Matched expertise keywords')}
          </h6>
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.map((keyword, index) => (
              <Badge key={index} variant="primary" shape="pill" tone="outline">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Top Proposals Section */}
      {topProposals.length > 0 && (
        <div>
          <h6 className="font-medium mb-2.5">
            {translate('Best matching proposals')}
          </h6>
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Proposal')}</TableHead>
                <TableHead className="text-center">
                  {translate('Affinity')}
                </TableHead>
                <TableHead className="text-center">
                  {translate('COI status')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProposals.map((proposal) => (
                <TableRow key={proposal.uuid}>
                  <TableCell>
                    <div>
                      {proposal.slug && (
                        <span className="text-quaternary me-1.5">
                          {proposal.slug}:
                        </span>
                      )}
                      {proposal.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium text-success">
                      {formatScore(proposal.affinity)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <COIBadge proposal={proposal} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Source Type Info */}
      {row.source_type && (
        <div className="mt-2.5 pt-2.5 border-t border-t-secondary">
          <small className="text-quaternary">
            {translate('Match source')}:{' '}
            {row.source_type_display || row.source_type}
          </small>
        </div>
      )}
    </ExpandableContainer>
  );
};
