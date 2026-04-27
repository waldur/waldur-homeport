import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { MermaidChart } from '@/core/MermaidChart';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { MatchingConfig, ALGORITHM_LABELS } from './types';

interface Props {
  resolve: {
    config: MatchingConfig;
  };
}

const generateAffinityFlowDiagram = (config: MatchingConfig): string => {
  const method = config?.affinity_method || 'combined';
  const keywordWeight = config?.keyword_weight ?? 0.4;
  const textWeight = config?.text_weight ?? 0.6;

  const showKeyword = method === 'keyword' || method === 'combined';
  const showText = method === 'tfidf' || method === 'combined';

  return `
flowchart TB
    subgraph trigger["Compute Affinities"]
        A[Call Manager clicks 'Compute matrix'] --> B["API: POST /compute-affinities/"]
    end

    subgraph inputs["Input Data"]
        B --> C{For each<br/>Reviewer × Proposal}

        C --> D[Reviewer Profile]
        C --> E[Proposal Content]

        D --> D1["Expertise keywords<br/>(weighted by proficiency)"]
        D --> D2["Recent publications<br/>(last 5 years)"]
        D --> D3["Biography text"]

        E --> E1["Proposal title"]
        E --> E2["Project summary"]
        E --> E3["Description"]
    end

    subgraph scoring["Affinity Scoring (method: ${method})"]
        ${
          showKeyword
            ? `D1 --> F["Keyword Matching"]
        E1 & E2 & E3 --> F
        F --> F1["Score: 0-1<br/>Weight: ${(keywordWeight * 100).toFixed(0)}%"]`
            : ''
        }

        ${
          showText
            ? `D1 & D2 & D3 --> G["TF-IDF Similarity"]
        E1 & E2 & E3 --> G
        G --> G1["Score: 0-1<br/>Weight: ${(textWeight * 100).toFixed(0)}%"]`
            : ''
        }

        ${method === 'combined' ? `F1 & G1 --> H["Combined Score"]` : showKeyword ? `F1 --> H["Final Score"]` : `G1 --> H["Final Score"]`}
    end

    subgraph output["Output"]
        H --> I[ReviewerProposalAffinity]
        I --> I1["affinity_score: 0-1"]
        I --> I2["keyword_score"]
        I --> I3["text_score"]
    end

    style F fill:#e8f5e9,color:#000
    style G fill:#e3f2fd,color:#000
    style H fill:#fff3e0,color:#000
`;
};

const generateAssignmentDiagram = (config: MatchingConfig): string => {
  const algorithm = config?.algorithm || 'minmax';

  return `
flowchart LR
    subgraph matrix["Affinity Matrix"]
        A["Reviewer × Proposal<br/>scores computed"]
    end

    subgraph constraints["Constraints Applied"]
        A --> B{Assignment Algorithm}
        B --> C["Min reviewers/proposal: ${config?.min_reviewers_per_proposal ?? 3}"]
        B --> D["Max reviewers/proposal: ${config?.max_reviewers_per_proposal ?? 5}"]
        B --> E["Max proposals/reviewer: ${config?.max_proposals_per_reviewer ?? 10}"]
    end

    subgraph algorithm["Algorithm: ${ALGORITHM_LABELS[algorithm] || algorithm}"]
        C & D & E --> F["${algorithm === 'minmax' ? 'Balance load across reviewers' : algorithm === 'fairflow' ? 'Ensure quality threshold' : 'Optimize global assignment'}"]
    end

    subgraph output["Proposed Assignments"]
        F --> G["Reviewer ↔ Proposal<br/>assignments"]
    end

    style B fill:#fff3e0,color:#000
    style F fill:#e8f5e9,color:#000
`;
};

const SCORING_METHODS = [
  {
    method: 'keyword',
    label: translate('Keyword Matching'),
    description: translate(
      'Matches reviewer expertise keywords against proposal text. Keywords are weighted by proficiency level: Expert (100%), Familiar (70%).',
    ),
    formula: translate(
      'Score = matched keyword weights / total keyword weights',
    ),
  },
  {
    method: 'tfidf',
    label: translate('TF-IDF Similarity'),
    description: translate(
      'Computes text similarity using Term Frequency-Inverse Document Frequency. Builds vocabulary from all reviewers and proposals in the call for better weighting.',
    ),
    formula: translate('Score = cosine similarity of TF-IDF vectors'),
  },
  {
    method: 'combined',
    label: translate('Combined'),
    description: translate(
      'Weighted combination of keyword and TF-IDF scores. Default: 40% keyword + 60% text.',
    ),
    formula: translate(
      'Score = (keyword_weight × keyword_score) + (text_weight × text_score)',
    ),
  },
];

const DATA_SOURCES = [
  {
    source: translate('Reviewer Profile'),
    fields: [
      {
        field: translate('Expertise keywords'),
        description: translate(
          'Keywords with proficiency levels (Expert, Familiar, Learning). Expert keywords are weighted 3×, Familiar 2×.',
        ),
      },
      {
        field: translate('Publications'),
        description: translate(
          'Titles and abstracts from the last 5 years (excludes publications marked as excluded from matching).',
        ),
      },
      {
        field: translate('Biography'),
        description: translate(
          "Free-text description of the reviewer's background.",
        ),
      },
    ],
  },
  {
    source: translate('Proposal'),
    fields: [
      {
        field: translate('Title'),
        description: translate('Proposal name/title.'),
      },
      {
        field: translate('Project summary'),
        description: translate('Main summary of the proposed project.'),
      },
      {
        field: translate('Description'),
        description: translate('Detailed proposal description if available.'),
      },
    ],
  },
];

export const MatchingSummaryDialog: FC<Props> = ({ resolve }) => {
  const { config } = resolve;
  const currentMethod = config?.affinity_method || 'combined';

  return (
    <ModalDialog
      title={translate('How Reviewer-Proposal Matching works')}
      closeButton
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <div className="d-flex flex-column gap-8">
        {/* Important Note */}
        <section>
          <div className="alert alert-info">
            <strong>{translate('Who is included in matching:')}</strong>
            <ul className="mb-0 mt-2">
              <li>
                {translate(
                  'Only reviewers who have ACCEPTED the pool invitation are included.',
                )}
              </li>
              <li>
                {translate(
                  'All proposals from all rounds in this call are matched.',
                )}
              </li>
              <li>
                {translate(
                  'Affinity scores are computed and cached for all reviewer-proposal pairs.',
                )}
              </li>
            </ul>
          </div>
        </section>

        {/* Affinity Computation Flow */}
        <section>
          <h4 className="mb-4">{translate('Affinity computation flow')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'When you click "Compute matrix", the system calculates how well each reviewer matches each proposal based on their expertise and the proposal content.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart
              code={generateAffinityFlowDiagram(config)}
              className="text-center"
            />
          </div>
        </section>

        {/* Scoring Methods */}
        <section>
          <h4 className="mb-4">{translate('Scoring methods')}</h4>
          <div className="table-responsive">
            <table className="table align-middle table-row-bordered fs-6 gy-4 gx-5">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th>{translate('Method')}</th>
                  <th>{translate('Description')}</th>
                  <th>{translate('Formula')}</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {SCORING_METHODS.map((method) => (
                  <tr key={method.method}>
                    <td className="fw-bold text-gray-800">
                      {method.label}
                      {method.method === currentMethod && (
                        <Badge variant="success" outline className="ms-2">
                          {translate('Active')}
                        </Badge>
                      )}
                    </td>
                    <td>{method.description}</td>
                    <td>
                      <code className="text-primary">{method.formula}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Data Sources */}
        <section>
          <h4 className="mb-4">{translate('Data sources')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'The following data is used to compute affinity scores:',
            )}
          </p>
          {DATA_SOURCES.map((source) => (
            <div key={source.source} className="mb-4">
              <h6 className="fw-bold">{source.source}</h6>
              <ul className="mb-0">
                {source.fields.map((field) => (
                  <li key={field.field}>
                    <strong>{field.field}:</strong> {field.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Assignment Algorithm */}
        <section>
          <h4 className="mb-4">{translate('Assignment algorithm')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Once affinity scores are computed, an assignment algorithm can be used to optimally assign reviewers to proposals while respecting constraints.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart
              code={generateAssignmentDiagram(config)}
              className="text-center"
            />
          </div>
        </section>

        {/* Score Interpretation */}
        <section>
          <h4 className="mb-4">{translate('Score interpretation')}</h4>
          <div className="d-flex flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2">
              <Badge variant="success" outline>
                80-100%
              </Badge>
              <span>{translate('Excellent match')}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge variant="primary" outline>
                60-79%
              </Badge>
              <span>{translate('Good match')}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge variant="warning" outline>
                40-59%
              </Badge>
              <span>{translate('Moderate match')}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge variant="danger" outline>
                20-39%
              </Badge>
              <span>{translate('Weak match')}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge variant="secondary" outline>
                0-19%
              </Badge>
              <span>{translate('Poor match')}</span>
            </div>
          </div>
        </section>
      </div>
    </ModalDialog>
  );
};
