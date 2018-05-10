import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import * as actions from './actions';
import './ResourceAnalysis.scss';
import { ResourceAnalysisList } from './ResourceAnalysisList';
import { getSearchValue, getLoading, getProjectsSelector } from './selectors';
import { Project } from './types';

interface PureResourceAnalysisProps extends TranslateProps {
  searchValue: string;
  loading: boolean;
  projects: Project[];
  onSearchFilterChange(evt: React.ChangeEvent<HTMLInputElement>): void;
  fetchProjects(): void;
}

export class PureResourceAnalysis extends React.Component<PureResourceAnalysisProps> {
  componentDidMount() { this.props.fetchProjects(); }

  render() {
    const { searchValue, translate, projects, onSearchFilterChange, loading } = this.props;

    if (loading) { return (<LoadingSpinner />); }

    return (
      <div className="ibox">
        <div className="ibox-title">
          <h3>{translate('Projects ({count})', { count: projects.length })}</h3>
        </div>
        <div className="ibox-content">
          <div className="form-group">
            <div className="search-box">
              <input
                id="resource-usage-search-box"
                className="form-control"
                type="text"
                placeholder={translate('Filter projects')}
                value={searchValue}
                onChange={onSearchFilterChange}
              />
              <label htmlFor="resource-usage-search-box">
                <i className="fa fa-search" />
              </label>
            </div>
            <div>
              <ResourceAnalysisList projects={projects} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  searchValue: getSearchValue(state),
  projects: getProjectsSelector(state),
  loading: getLoading(state),
});

const mapDispatchToProps = dispatch => ({
  onSearchFilterChange: (evt: React.ChangeEvent<HTMLInputElement>) => dispatch(actions.analyticsSearchFilterChange(evt.target.value)),
  fetchProjects: () => dispatch(actions.analyticsProjectsFetch()),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
);

export const ResourceAnalysis = enhance(PureResourceAnalysis);

export default connectAngularComponent(ResourceAnalysis, []);
