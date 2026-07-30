import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { NestedQoS } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

interface OwnProps {
  row: NestedQoS;
}

export const OfferingQoSExpandableRow: FC<OwnProps> = ({ row }) => (
  <ExpandableContainer asTable>
    <Row>
      <Col lg={6}>
        <Field
          label={translate('Description')}
          value={renderFieldOrDash(row.description)}
          space={2}
        />
        <Field
          label={translate('Minimum nodes per job')}
          value={renderFieldOrDash(row.min_nodes)}
          space={2}
        />
        <Field
          label={translate('Default time limit (minutes)')}
          value={renderFieldOrDash(row.default_time)}
          space={2}
        />
        <Field
          label={translate('Preemption grace time (seconds)')}
          value={renderFieldOrDash(row.grace_time)}
          space={2}
        />
        <Field
          label={translate('Scheduling priority')}
          value={renderFieldOrDash(row.priority)}
          space={2}
        />
      </Col>
      <Col lg={6}>
        <Field
          label={translate('Aggregate TRES (GrpTRES)')}
          value={renderFieldOrDash(row.grp_tres)}
          space={2}
        />
        <Field
          label={translate('Max TRES per job')}
          value={renderFieldOrDash(row.max_tres_per_job)}
          space={2}
        />
        <Field
          label={translate('Max TRES per node')}
          value={renderFieldOrDash(row.max_tres_per_node)}
          space={2}
        />
        <Field
          label={translate('Max TRES per user')}
          value={renderFieldOrDash(row.max_tres_per_user)}
          space={2}
        />
        <Field
          label={translate('Min TRES per job')}
          value={renderFieldOrDash(row.min_tres_per_job)}
          space={2}
        />
        <Field
          label={translate('Flags')}
          value={renderFieldOrDash(row.flags)}
          space={2}
        />
      </Col>
    </Row>
  </ExpandableContainer>
);
