import { FC } from 'react';
import { useFormState } from 'react-final-form';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'waldur-ui';

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
    <Accordion
      type="single"
      collapsible
      className="mb-7 rounded-md border-[1px] border-solid border-[var(--surface-card-border)]"
    >
      <AccordionItem value="chart">
        <AccordionTrigger>
          <div className="fw-bolder">
            {translate('Project cost history')}
            {isLoadingChart && <LoadingSpinnerSimple className="ms-2" />}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {errorChart ? (
            <LoadingErred loadData={refetchChart} />
          ) : chartOptions ? (
            <EChart options={chartOptions} height="150px" />
          ) : null}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
