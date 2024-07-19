import { debounce } from 'lodash';
import { Component } from 'react';

import { FilterBox } from '@waldur/form/FilterBox';
import { translate } from '@waldur/i18n';

interface TableQueryProps {
  query: string;
  setQuery: (query: string) => void;
}

interface State {
  query: string;
}

export class TableQuery extends Component<TableQueryProps, State> {
  constructor(props) {
    super(props);
    this.state = { query: props.query || '' };
  }

  setQuery = (event) => {
    this.setState({
      query: event.target.value,
    });
    this.applyQuery();
  };

  applyQuery = debounce(() => {
    this.props.setQuery(this.state.query);
  }, 1000);

  render() {
    return (
      <FilterBox
        type="search"
        placeholder={translate('Search') + '...'}
        value={this.state.query}
        onChange={this.setQuery}
      />
    );
  }

  componentDidUpdate(prevProps: Readonly<TableQueryProps>): void {
    // This block is implemented to make the "Clear search" button work
    if (
      !this.props.query &&
      prevProps.query &&
      prevProps.query === this.state.query
    ) {
      this.setState({ query: '' });
    }
  }
}
