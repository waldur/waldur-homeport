import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { projectCreditsList } from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { Project } from '@/workspace/types';

import { usePolicyWatchData } from './usePolicyWatchData';
import { HealthView } from './views/HealthView';

interface Props {
  project: Project;
}

/**
 * The Health view — pacing, credit lifecycle, and per-resource state — shown as
 * a first-class dashboard block for projects that have a credit allocation.
 *
 * Without an allocation there is no credit widget at all, and the block must
 * not pay for one either: the credit lookup is a single list call, and only a
 * hit mounts the inner component whose hook fans out to policies, resources,
 * invoices and organization credit.
 */
export const ProjectCreditHealthBlock: FC<Props> = ({ project }) => {
  const { data: credit } = useQuery({
    queryKey: ['policy-watch-project-credit', project?.uuid],
    queryFn: () =>
      projectCreditsList({ query: { project_uuid: project.uuid } }).then((r) =>
        r.data && r.data.length > 0 ? r.data[0] : null,
      ),
    enabled: Boolean(project?.uuid),
    staleTime: SHORT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  if (!credit) {
    return null;
  }
  return <CreditHealth project={project} />;
};

const CreditHealth: FC<Props> = ({ project }) => {
  const data = usePolicyWatchData(project);

  if (data.isLoading || data.hasError || !data.runway.credit) {
    return null;
  }

  return (
    <Row className="mt-3">
      <Col xs={12} className="mb-3">
        <HealthView data={data} />
      </Col>
    </Row>
  );
};
