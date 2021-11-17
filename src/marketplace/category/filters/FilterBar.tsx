import { debounce } from 'lodash';
import { Component } from 'react';

import { TranslateProps } from '@waldur/i18n';

interface FilterBarProps extends TranslateProps {
  filterQuery: string;
  setFilterQuery: (query: string) => void;
}

interface FilterBarState {
  filter: string;
}

export class FilterBar extends Component<FilterBarProps, FilterBarState> {
  constructor(props) {
    super(props);
    this.state = {
      filter: props.filterQuery || '',
    };
  }

  setFilterQuery = (e) => {
    this.setState({ filter: e.target.value });
    this.applyQuery();
  };

  applyQuery = debounce(() => {
    this.props.setFilterQuery(this.state.filter);
  }, 1000);

  render() {
    return (
      <input
        type="text"
        className="form-control"
        value={this.state.filter}
        placeholder={this.props.translate('Search for offerings...')}
        onChange={this.setFilterQuery}
      />
    );
  }
}
