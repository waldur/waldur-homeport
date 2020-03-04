/* eslint-disable */
import { IChangesObject } from 'angular';
import { assign, mapValues, some } from 'lodash';

type OnChanges<T> = {
  [K in keyof T]: IChangesObject<T[K]>;
};

abstract class NgComponent<
  Props extends { [k: string]: any } = {},
  State extends { [k: string]: any } = {}
> {
  private __isFirstRender = true;

  protected state: State = {} as State;
  public props: Partial<Props> = {} as Partial<Props>;

  /*
    eg. {
      as: {currentValue: [1, 2, 3], previousValue: [1, 2]},
      bs: {currentValue: 42, previousValue: undefined}
    }
  */
  // nb: this method is explicity exposed for unit testing
  public $onChanges(changes: OnChanges<Partial<Props>>) {
    const oldProps = this.props;

    // TODO: fix Lodash typings upstream
    const newProps = mapValues(changes, 'currentValue') as Partial<Props>;

    // TODO: implement nextState (which also means implement this.setState)
    const nextProps = assign({}, this.props, newProps);

    if (this.__isFirstRender) {
      assign(this, { props: nextProps });
      this.componentWillMount();
      this.render();
      this.__isFirstRender = false;
    } else {
      if (!this.didPropsChange(newProps, oldProps)) return;
      this.componentWillReceiveProps(nextProps);
      const shouldUpdate = this.shouldComponentUpdate(nextProps, this.state);
      assign(this, { props: nextProps });
      if (!shouldUpdate) return;

      this.componentWillUpdate(this.props, this.state);
      this.render();
      this.componentDidUpdate(this.props, this.state);
    }
  }

  $postLink() {
    this.componentDidMount();
  }

  $onDestroy() {
    this.componentWillUnmount();
  }

  protected didPropsChange(
    newProps: Partial<Props>,
    oldProps: Partial<Props>,
  ): boolean {
    return some(newProps, (v, k) => v !== oldProps[k]);
  }

  /*
    lifecycle hooks
  */
  componentWillMount(): void {}
  componentDidMount(): void {}
  componentWillReceiveProps(_props: Partial<Props>): void {}
  shouldComponentUpdate(
    _nextProps: Partial<Props>,
    _nextState: State,
  ): boolean {
    return true;
  }
  componentWillUpdate(_props: Partial<Props>, _state: State): void {}
  componentDidUpdate(_props: Partial<Props>, _state: State): void {}
  componentWillUnmount() {}
  render(): void {}
}

export default NgComponent;
