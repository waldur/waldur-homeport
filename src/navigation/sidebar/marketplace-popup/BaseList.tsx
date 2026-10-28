import { FunctionComponent } from 'react';

export const BaseList: FunctionComponent<{
  items;
  selectedItem;
  selectItem;
  EmptyPlaceholder;
  ItemComponent;
  linkState?;
}> = ({
  items,
  selectedItem,
  selectItem,
  EmptyPlaceholder,
  ItemComponent,
  linkState,
}) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col pb-8">
        {items.length === 0 ? (
          <EmptyPlaceholder />
        ) : (
          items.map((item) => (
            <ItemComponent
              key={item.uuid}
              item={item}
              selectedItem={selectedItem}
              onClick={selectItem}
              linkState={linkState}
            />
          ))
        )}
      </div>
    </div>
  );
};
