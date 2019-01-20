import * as React from 'react';

interface QueryState<Data> {
  loading: boolean;
  erred: boolean;
  data?: Data;
}

interface QueryProps<Variables, Data> {
  variables?: Variables;
  loader(variables: Variables): Promise<Data>;
  children: React.StatelessComponent<QueryState<Data>>;
}

export class Query<Variables = object, Data = object> extends
  React.Component<QueryProps<Variables, Data>, QueryState<Data>> {
  state = {
    loading: true,
    erred: false,
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

  async loadData() {
    this.safeSetState({
      loading: true,
      erred: false,
    });
    try {
      const data = await this.props.loader(this.props.variables);
      this.safeSetState({
        data,
        loading: false,
        erred: false,
      });
    } catch {
      this.safeSetState({
        loading: false,
        erred: true,
      });
    }
  }

  render() {
    return this.props.children(this.state);
  }
}
