import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { EChart } from '@waldur/core/EChart';
import { ToggleOpenProps, toggleOpen } from '@waldur/core/HOC/toggleOpen';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tooltip } from '@waldur/core/Tooltip';
import { TranslateProps, withTranslation } from '@waldur/i18n';

import {
  getPieChartsDataSelector,
  getBarChartsDataSelector,
  getExceededQuotasSelector,
  getBarChartsLoadingSelector,
} from './selectors';
import { Project, Quota, ChartData } from './types';

interface PureResourceAnalysisItemProps extends TranslateProps, ToggleOpenProps {
  exceededQuotas: Quota[];
  project: Project;
  pieChartsData: ChartData[];
  barChartsData: ChartData[];
  barChartsLoading: boolean;
}

export const PureResourceAnalysisItem = (props: PureResourceAnalysisItemProps) => {
  const { project, isOpen, handleToggleOpen, pieChartsData, barChartsData, translate, exceededQuotas, barChartsLoading } = props;
  const usagePieCharts = pieChartsData.map(pieChart => {
    const { limit, options, id, label, exceeds, maxFileSizeName } = pieChart;
    const content = limit === -1 ? translate('Unlimited') : (<EChart options={options} />);
    const title = `${label}${(maxFileSizeName ? `, ${maxFileSizeName}` : '')} :`;

    return (
      <li key={id}>
        <span className={classNames({
          'chart-title': true,
          'text-danger': exceeds,
        })}>
          {title}
        </span>
        <span className="chart-content">{content}</span>
      </li>
    );
  });
  const usageBarCharts = barChartsData.map(barChart => {
    const { options, id, label, exceeds, maxFileSizeName } = barChart;
    const title = `${label}${(maxFileSizeName ? `, ${maxFileSizeName}` : '')} :`;

    return (
      <li key={id}>
        <span className={classNames(
          'chart-title',
          { 'text-danger': exceeds, }
        )}>
          {title}
        </span>
        <span className="chart-content">
          <EChart options={options} />
        </span>
      </li >
    );
  });
  const tooltipLabelContent = exceededQuotas.length && exceededQuotas.map(quota => (
    <p key={`exceeds-quota-${quota.uuid}`}>{translate('{quota} usage exceeds quota limit.', { quota: quota.label })}</p>
  ));

  return (
    <div>
      <div
        className={classNames(
          'resource-analysis-item__title',
          'content-between-center',
          { opened: isOpen, }
        )}
        onClick={handleToggleOpen}
      >
        <h4 className={classNames({ 'text-danger': !!exceededQuotas.length })}>
          <span>{project.name}</span>
          {!!exceededQuotas.length &&
            <Tooltip
              id={project.uuid}
              label={tooltipLabelContent}
            >
              <i className="fa fa-exclamation-triangle" />
            </Tooltip>
          }
        </h4>
        <div>
          <i
            className={classNames(
              'fa',
              {
                'fa-angle-up': isOpen,
                'fa-angle-down': !isOpen,
              })}
          />
        </div>
      </div>
      <div className="resource-analysis-item__content">
        {isOpen &&
          <ul className={
            classNames(
              'resource-analysis-item__bar-chart-list',
              {
                'content-center-center': barChartsLoading,
              }
            )}>
            {
              barChartsLoading ? (<LoadingSpinner />) : usageBarCharts
            }
          </ul>
        }
        {!isOpen &&
          <ul className="resource-analysis-item__pie-chart-list">{usagePieCharts}</ul>
        }
      </div>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  pieChartsData: getPieChartsDataSelector(state, ownProps),
  barChartsData: getBarChartsDataSelector(state, ownProps),
  barChartsLoading: getBarChartsLoadingSelector(state, ownProps),
  exceededQuotas: getExceededQuotasSelector(state, ownProps),
});

const enhance = compose(
  toggleOpen,
  connect(mapStateToProps),
  withTranslation,
);

export const ResourceAnalysisItem = enhance(PureResourceAnalysisItem);
