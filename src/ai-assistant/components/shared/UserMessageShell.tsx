import { MessagePrimitive } from '@assistant-ui/react';
import { FC, PropsWithChildren } from 'react';

// Shared user-message wrapper. The authenticated thread slots an action bar
// (edit) in as children; the anonymous thread renders none.
export const UserMessageShell: FC<PropsWithChildren> = ({ children }) => (
  <MessagePrimitive.Root asChild>
    <div className="aui-user-message-root" data-role="user">
      <div className="aui-user-message-content-wrapper">
        <div className="aui-user-message-content">
          <MessagePrimitive.Parts />
          {children}
        </div>
      </div>
    </div>
  </MessagePrimitive.Root>
);
