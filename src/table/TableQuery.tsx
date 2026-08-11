import { debounce } from 'lodash-es';
import { Component } from 'react';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';

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
        placeholder={translate('Search...')}
        value={this.state.query}
        onChange={this.setQuery}
        className="min-w-125px"
      />
    );
  }

  componentDidUpdate(prevProps: Readonly<TableQueryProps>): void {
    // Reflect a term that did not come from this box — cleared by the toolbar,
    // or applied by another component. `prevProps.query === this.state.query`
    // means the last committed value was ours, so nothing is mid-typing: the
    // commit is debounced, and overwriting during that window would delete the
    // user's keystrokes.
    if (
      this.props.query !== prevProps.query &&
      prevProps.query === this.state.query
    ) {
      this.setState({ query: this.props.query || '' });
    }
  }
}
