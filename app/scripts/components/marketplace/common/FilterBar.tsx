import debounce from 'lodash.debounce';
import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';

interface FilterBarProps {
  filterQuery: string;
  setFilterQuery: (query: string) => void;
}

interface FilterBarState {
  filter: string;
}

export class FilterBar extends React.Component<FilterBarProps & TranslateProps, FilterBarState> {
  constructor(props) {
    super(props);
    this.state = {
      filter: '',
    };
  }

  setFilterQuery = e => {
    this.setState({filter: e.target.value});
    this.applyQuery();
  }

  applyQuery = debounce(() => {
    this.props.setFilterQuery(this.state.filter);
  }, 1000);

  render() {
    return (
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder={this.props.translate('Search for apps and services...')}
          onChange={this.setFilterQuery}
        />
        <span className="input-group-btn">
          <button className="btn btn-primary">
            {this.props.translate('Search')}
          </button>
        </span>
      </div>
    );
  }
}
