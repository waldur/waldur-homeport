import * as React from 'react';

interface QueryState<Data> {
  loading: boolean;
  loaded: boolean;
  error?: any;
  data?: Data;
}

export interface QueryChildProps<Data> extends QueryState<Data> {
  loadData(): Promise<void>;
}

interface QueryProps<Variables, Data> {
  variables?: Variables;
  loader(variables: Variables): Promise<Data>;
  children: React.StatelessComponent<QueryChildProps<Data>>;
}

export class Query<Variables = object, Data = object> extends
  React.Component<QueryProps<Variables, Data>, QueryState<Data>> {
  state = {
    loading: true,
    loaded: false,
    error: null,
    data: null,
  };

  mounted = false;

  componentDidMount() {
    this.loadData();
    this.mounted = true;
  }

  componentDidUpdate(prevProps: QueryProps<Variables, Data>) {
    if (prevProps.variables !== this.props.variables) {
      this.loadData();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  safeSetState(state) {
    if (this.mounted) {
      this.setState(state);
    }
  }

  loadData = async () => {
    this.safeSetState({
      loading: true,
      erred: false,
    });
    try {
      const data = await this.props.loader(this.props.variables);
      this.safeSetState({
        data,
        loading: false,
        loaded: true,
        erred: false,
      });
    } catch (error) {
      this.safeSetState({
        loading: false,
        error,
      });
    }
  }

  render() {
    return this.props.children({...this.state, loadData: this.loadData});
  }
}
