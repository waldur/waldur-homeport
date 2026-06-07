import {
  Children,
  CSSProperties,
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MenuListProps } from 'react-select';
import { VariableSizeList } from 'react-window';

// Default falls in line with react-select's default menu maxHeight / option
// height (35px). Group headings render shorter (25px) per react-select v5.
const DEFAULT_ITEM_HEIGHT = 35;
const DEFAULT_GROUP_HEADING_HEIGHT = 25;

interface StyledHeight {
  height?: number | string;
}

const numericHeight = (v?: number | string): number | undefined => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

// react-select renders one element per option. For grouped option lists, group
// rows wrap their nested option rows. The virtualizer needs every row at the
// top level so it can index/measure them — flatten the tree, tagging the group
// header so its height calculation uses the smaller groupHeading style.
const flattenGroupedChildren = (nodes: ReactNode[]): ReactNode[] =>
  nodes.reduce<ReactNode[]>((acc, group) => {
    if (!isValidElement(group)) return acc;
    const props = group.props as { children?: ReactNode };
    if (typeof props.children === 'string' && props.children) {
      return [...acc, group];
    }
    const inner = props.children ?? [];
    return [
      ...acc,
      cloneElement(group as ReactElement, { type: 'group' } as any, []),
      ...(Array.isArray(inner) ? inner : [inner]),
    ];
  }, []);

const getFocusedIndex = (nodes: ReactNode[]): number => {
  const idx = nodes.findIndex(
    (child) =>
      isValidElement(child) &&
      (child.props as { isFocused?: boolean }).isFocused,
  );
  return Math.max(idx, 0);
};

const createGetHeight =
  (styles: {
    groupHeading: StyledHeight;
    loadingMessage: StyledHeight;
    noOptionsMessage: StyledHeight;
    option: StyledHeight;
  }) =>
  (child: ReactNode): number => {
    if (!isValidElement(child)) return DEFAULT_ITEM_HEIGHT;
    const childProps = child.props as {
      type?: string;
      children?: ReactNode;
      selectProps?: {
        noOptionsMessage?: (state: { inputValue: string }) => ReactNode;
        loadingMessage?: (state: { inputValue: string }) => ReactNode;
      };
    };
    if (childProps.type === 'group') {
      return (
        numericHeight(styles.groupHeading.height) ??
        DEFAULT_GROUP_HEADING_HEIGHT
      );
    }
    if (childProps.type === 'option') {
      return numericHeight(styles.option.height) ?? DEFAULT_ITEM_HEIGHT;
    }
    const { noOptionsMessage, loadingMessage } = childProps.selectProps ?? {};
    if (
      typeof noOptionsMessage === 'function' &&
      childProps.children === noOptionsMessage({ inputValue: '' })
    ) {
      return (
        numericHeight(styles.noOptionsMessage.height) ?? DEFAULT_ITEM_HEIGHT
      );
    }
    if (
      typeof loadingMessage === 'function' &&
      childProps.children === loadingMessage({ inputValue: '' })
    ) {
      return numericHeight(styles.loadingMessage.height) ?? DEFAULT_ITEM_HEIGHT;
    }
    return DEFAULT_ITEM_HEIGHT;
  };

interface MeasuringRowProps {
  node: ReactNode;
  index: number;
  onMeasured: (index: number, height: number) => void;
}

// Measure the row after layout so variable-height options (multi-line labels)
// reflow correctly. We report the height back so the VariableSizeList can use
// it on subsequent renders.
const MeasuringRow = ({ node, index, onMeasured }: MeasuringRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      onMeasured(index, ref.current.getBoundingClientRect().height);
    }
  });
  return <div ref={ref}>{node}</div>;
};

export function VirtualMenuList(props: MenuListProps<unknown, boolean>) {
  const {
    getStyles,
    innerRef,
    innerProps,
    selectProps,
    children: rawChildren,
  } = props;

  const items = useMemo(() => {
    const arr = Children.toArray(rawChildren);
    const head = arr[0];
    const isGrouped =
      isValidElement(head) &&
      Array.isArray(
        ((head.props as { data?: { options?: unknown[] } }).data ?? {}).options,
      );
    return isGrouped ? flattenGroupedChildren(arr) : arr;
  }, [rawChildren]);

  const styles = {
    groupHeading: getStyles('groupHeading', props as any) as StyledHeight,
    loadingMessage: getStyles('loadingMessage', props as any) as StyledHeight,
    noOptionsMessage: getStyles(
      'noOptionsMessage',
      props as any,
    ) as StyledHeight,
    option: getStyles('option', props as any) as StyledHeight,
  };
  const getHeight = useMemo(
    () => createGetHeight(styles),
    [
      styles.groupHeading.height,
      styles.loadingMessage.height,
      styles.noOptionsMessage.height,
      styles.option.height,
    ],
  );
  const initialHeights = useMemo(
    () => items.map(getHeight),
    [items, getHeight],
  );
  const focusedIndex = useMemo(() => getFocusedIndex(items), [items]);

  const [measuredHeights, setMeasuredHeights] = useState<
    Record<number, number>
  >({});

  // Reset measurements whenever the child set changes.
  useEffect(() => {
    setMeasuredHeights({});
  }, [rawChildren]);

  const totalHeight = useMemo(
    () =>
      initialHeights.reduce(
        (sum, h, idx) => sum + (measuredHeights[idx] ?? h),
        0,
      ),
    [initialHeights, measuredHeights],
  );

  const menuListStyles = getStyles(
    'menuList',
    props as any,
  ) as CSSProperties & {
    maxHeight?: number;
    paddingTop?: number;
    paddingBottom?: number;
  };
  const {
    maxHeight = 300,
    paddingTop = 0,
    paddingBottom = 0,
    ...listStyle
  } = menuListStyles;

  const menuHeight = Math.min(
    maxHeight as number,
    totalHeight + paddingTop + paddingBottom,
  );
  const estimatedItemSize =
    items.length > 0
      ? Math.max(Math.floor(totalHeight / items.length), DEFAULT_ITEM_HEIGHT)
      : DEFAULT_ITEM_HEIGHT;

  const listRef = useRef<VariableSizeList>(null);

  // Scroll focused option (keyboard or initial selection) into view.
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      listRef.current.scrollToItem(focusedIndex);
    }
  }, [focusedIndex]);

  const onMeasured = (index: number, measured: number) => {
    if (measuredHeights[index] === measured) return;
    setMeasuredHeights((prev) =>
      prev[index] === measured ? prev : { ...prev, [index]: measured },
    );
    // Tell react-window to invalidate its cached sizes from this row
    // onwards. Calling it *outside* the setState updater is important —
    // the updater function can run multiple times in React 18's strict
    // mode / batched updates, and resetAfterIndex synchronously forces
    // the List to re-render. Calling it inside the updater would queue a
    // new render mid-batch and trip "Maximum update depth exceeded".
    listRef.current?.resetAfterIndex(index);
  };

  const { classNamePrefix, isMulti } = selectProps ?? ({} as any);
  const className = classNamePrefix
    ? `${classNamePrefix}__menu-list${isMulti ? ` ${classNamePrefix}__menu-list--is-multi` : ''}`
    : undefined;

  // Re-introduce the menuList paddings that react-select would have applied —
  // VariableSizeList doesn't natively support padding so we inflate the inner
  // container and offset every row by paddingTop.
  const InnerElementType = forwardRef<
    HTMLDivElement,
    { style?: CSSProperties; children?: ReactNode }
  >(({ style, children, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      style={{
        ...style,
        height:
          parseFloat(String((style as any)?.height ?? 0)) +
          paddingTop +
          paddingBottom +
          'px',
      }}
    >
      {children}
    </div>
  ));
  InnerElementType.displayName = 'VirtualMenuListInner';

  // Use VariableSizeList's outer element slot to attach react-select's
  // innerProps (role="listbox", aria attributes, the listbox id used by
  // the input's aria-controls, and react-select's own mouse handlers).
  // Without this the virtualized path drops accessibility metadata that
  // the default react-select MenuList would carry.
  const OuterElementType = forwardRef<
    HTMLDivElement,
    { style?: CSSProperties; children?: ReactNode; className?: string }
  >(({ style, children, className: outerClassName, ...rest }, ref) => (
    <div
      ref={ref}
      {...innerProps}
      {...rest}
      className={
        [className, outerClassName].filter(Boolean).join(' ') || undefined
      }
      style={style}
    >
      {children}
    </div>
  ));
  OuterElementType.displayName = 'VirtualMenuListOuter';

  return (
    <VariableSizeList
      ref={listRef}
      style={listStyle}
      outerRef={innerRef as any}
      outerElementType={OuterElementType}
      itemCount={items.length}
      itemData={items}
      height={menuHeight}
      width="100%"
      estimatedItemSize={estimatedItemSize}
      itemSize={(idx) =>
        measuredHeights[idx] ?? initialHeights[idx] ?? DEFAULT_ITEM_HEIGHT
      }
      innerElementType={InnerElementType}
    >
      {({ index, style, data }) => (
        <div
          style={{
            ...style,
            top:
              parseFloat(String((style as any).top ?? 0)) + paddingTop + 'px',
          }}
        >
          <MeasuringRow
            node={(data as ReactNode[])[index]}
            index={index}
            onMeasured={onMeasured}
          />
        </div>
      )}
    </VariableSizeList>
  );
}
