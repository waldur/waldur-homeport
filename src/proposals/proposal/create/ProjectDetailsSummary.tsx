import { FC } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { translate } from '@waldur/i18n';
import { Proposal } from '@waldur/proposals/types';

interface ProjectDetailsSummaryProps {
  proposal: Proposal;
  commentable?: boolean;
  paddingless?: boolean;
  hideHeader?: boolean;
}

export const ProjectDetailsSummary: FC<ProjectDetailsSummaryProps> = ({
  proposal,
  ...props
}) => (
  <Card>
    {!props.hideHeader && (
      <Card.Header className={props.paddingless ? 'px-0' : ''}>
        <Card.Title>{translate('Proposal summary')}</Card.Title>
      </Card.Header>
    )}
    <Card.Body className={props.paddingless ? 'p-0' : ''}>
      <Row>
        <Col xs={12} sm md={6}>
          <ReadOnlyFormControl
            label={translate('Project title')}
            value={proposal.name}
            floating
          />
        </Col>
        {props.commentable && (
          <Col xs={12} sm="auto" md={6} className="mb-4">
            <Button
              type="button"
              variant="dark"
              size="sm"
              className="h-50px me-2"
            >
              {translate('Comment')}
            </Button>
          </Col>
        )}
      </Row>

      <Row>
        <Col xs={12} md={6}>
          <ReadOnlyFormControl
            label={translate('Project summary')}
            value={proposal.project_summary}
            floating
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12} md={6}>
          <ReadOnlyFormControl
            label={translate('Detailed description')}
            value={proposal.description || 'N/A'}
            floating
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12} md={6}>
          <ReadOnlyFormControl
            label={translate('Project for civilian purpose?')}
            value={
              proposal.project_has_civilian_purpose
                ? translate('Yes')
                : translate('No')
            }
            floating
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12} md={6}>
          <ReadOnlyFormControl
            label={translate('Research field (OECD code)')}
            value={proposal.oecd_fos_2007_label || 'N/A'}
            floating
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12} md={6}>
          <ReadOnlyFormControl
            label={translate('Is the project confidential?')}
            value={
              proposal.project_is_confidential
                ? translate('Yes')
                : translate('No')
            }
            floating
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12} md={6}>
          <ReadOnlyFormControl
            label={translate('Project duration in days')}
            value={proposal.duration_in_days || 0}
            floating
          />
        </Col>
      </Row>

      {proposal.supporting_documentation.length > 0 && (
        <Row>
          <Col xs={12} md={6}>
            <ReadOnlyFormControl
              label={translate('Supporting documentation')}
              value={proposal.supporting_documentation}
            >
              <ul className="text-muted">
                {proposal.supporting_documentation.map((item, index) => (
                  <li key={index}>
                    <ExternalLink
                      url={item.file}
                      label={translate('File {index}', { index: index + 1 })}
                      iconless
                    />
                  </li>
                ))}
              </ul>
            </ReadOnlyFormControl>
          </Col>
        </Row>
      )}
    </Card.Body>
  </Card>
);
