import { FC } from 'react';
import { Accordion } from 'react-bootstrap';
import { useFormState } from 'react-final-form';

import { EChart } from '@/core/EChart';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useProjectCostChart } from '@/project/utils';

import { ProjectCreditFormData } from './types';

export const ProjectCostChart: FC = () => {
  const { values } = useFormState<ProjectCreditFormData>({
    subscription: { values: true },
  });
  const project = values.project;

  const {
    options: chartOptions,
    isLoading: isLoadingChart,
    error: errorChart,
    refetch: refetchChart,
  } = useProjectCostChart(project);

  if (!project) return null;

  return (
    <Accordion className="mb-7">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <div className="fw-bolder">
            {translate('Project cost history')}
            {isLoadingChart && <LoadingSpinnerSimple className="ms-2" />}
          </div>
        </Accordion.Header>
        <Accordion.Body>
          {errorChart ? (
            <LoadingErred loadData={refetchChart} />
          ) : chartOptions ? (
            <EChart options={chartOptions} height="150px" />
          ) : null}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};
