import { FC, useMemo } from 'react';
import { ReviewerSuggestion } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

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
      <Badge variant="success" pill outline>
        {translate('No conflict')}
      </Badge>
    );
  }

  const variant = proposal.coi_severity === 'real' ? 'danger' : 'warning';
  return (
    <Badge variant={variant} pill outline>
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

  if (topProposals.length === 0 && matchedKeywords.length === 0) {
    return (
      <ExpandableContainer className="p-4">
        <p className="text-muted mb-0">
          {translate('No detailed match information available.')}
        </p>
      </ExpandableContainer>
    );
  }

  return (
    <ExpandableContainer className="p-4">
      {/* Matched Keywords Section */}
      {matchedKeywords.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold mb-3">
            {translate('Matched expertise keywords')}
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {matchedKeywords.map((keyword, index) => (
              <Badge key={index} variant="primary" pill outline>
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Top Proposals Section */}
      {topProposals.length > 0 && (
        <div>
          <h6 className="fw-bold mb-3">
            {translate('Best matching proposals')}
          </h6>
          <div className="table-responsive">
            <table className="table table-sm table-row-bordered">
              <thead>
                <tr className="fw-bold text-muted">
                  <th>{translate('Proposal')}</th>
                  <th className="text-center">{translate('Affinity')}</th>
                  <th className="text-center">{translate('COI status')}</th>
                </tr>
              </thead>
              <tbody>
                {topProposals.map((proposal) => (
                  <tr key={proposal.uuid}>
                    <td>
                      <div>
                        {proposal.slug && (
                          <span className="text-muted me-2">
                            {proposal.slug}:
                          </span>
                        )}
                        {proposal.name}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="fw-bold text-success">
                        {formatScore(proposal.affinity)}
                      </span>
                    </td>
                    <td className="text-center">
                      <COIBadge proposal={proposal} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Source Type Info */}
      {row.source_type && (
        <div className="mt-3 pt-3 border-top">
          <small className="text-muted">
            {translate('Match source')}:{' '}
            {row.source_type_display || row.source_type}
          </small>
        </div>
      )}
    </ExpandableContainer>
  );
};
