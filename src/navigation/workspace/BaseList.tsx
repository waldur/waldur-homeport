import * as classNames from 'classnames';
import * as React from 'react';
import * as ListGroup from 'react-bootstrap/lib/ListGroup';
import * as ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import { Scrollbars } from 'react-custom-scrollbars';

export const BaseList = ({
  items,
  selectedItem,
  selectItem,
  EmptyPlaceholder,
  ItemComponent,
}) => {
  const scrollBarRef = React.useRef<Scrollbars>();
  const itemId = selectedItem?.uuid;

  const adjustScroll = React.useCallback(() => {
    if (itemId) {
      const view = scrollBarRef.current.view;
      const query = `[data-uuid="${itemId}"]`;
      const itemElement = view.querySelector(query);
      if (itemElement) {
        view.scrollTop = itemElement.offsetTop;
      }
    }
  }, [scrollBarRef, itemId]);
  React.useEffect(adjustScroll, []);

  return (
    <Scrollbars style={{ height: 300 }} ref={scrollBarRef}>
      <ListGroup>
        {items.length === 0 ? (
          <ListGroupItem>
            <EmptyPlaceholder />
          </ListGroupItem>
        ) : (
          items.map(item => (
            <ListGroupItem
              data-uuid={item.uuid}
              className={classNames({
                active: selectedItem && item.uuid == selectedItem.uuid,
              })}
              onClick={() => selectItem(item)}
              key={item.uuid}
            >
              <ItemComponent item={item} />
            </ListGroupItem>
          ))
        )}
      </ListGroup>
    </Scrollbars>
  );
};
