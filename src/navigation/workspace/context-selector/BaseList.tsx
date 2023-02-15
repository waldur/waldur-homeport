import classNames from 'classnames';
import {
  useRef,
  useCallback,
  useEffect,
  FunctionComponent,
  CSSProperties,
} from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';

export const BaseList: FunctionComponent<{
  items;
  selectedItem?;
  selectItem;
  EmptyPlaceholder;
  ItemComponent;
  filter;
  loadingUuid?: string;
  style?: CSSProperties;
}> = ({
  items,
  selectedItem,
  selectItem,
  EmptyPlaceholder,
  ItemComponent,
  filter,
  loadingUuid,
  style,
}) => {
  const scrollBarRef = useRef<Scrollbars>();
  const itemId = selectedItem?.uuid;

  const adjustScroll = useCallback(() => {
    if (itemId) {
      const view = scrollBarRef.current.view;
      const query = `[data-uuid="${itemId}"]`;
      const itemElement = view.querySelector(query);
      if (itemElement) {
        view.scrollTop = itemElement.offsetTop;
      }
    }
  }, [scrollBarRef, itemId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(adjustScroll, []);

  return (
    <Scrollbars style={style} ref={scrollBarRef}>
      <ListGroup>
        {items.length === 0 ? (
          <ListGroupItem>
            <EmptyPlaceholder />
          </ListGroupItem>
        ) : (
          items.map((item) => (
            <ListGroupItem
              data-uuid={item.uuid}
              className={classNames({
                active: selectedItem && item.uuid == selectedItem.uuid,
              })}
              onClick={() => selectItem(item)}
              key={item.uuid}
            >
              <ItemComponent
                item={item}
                filter={filter}
                loading={loadingUuid === item?.uuid}
              />
            </ListGroupItem>
          ))
        )}
      </ListGroup>
    </Scrollbars>
  );
};
