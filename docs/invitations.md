# Invitations Architecture

This document describes the architectural flow for handling invitations in the Waldur Homeport application.

## Invitation Types

There are three primary concepts involving invitations and access requests:

1. **User Invitations (`useCheckAndAccept`)**: Specific invitations sent directly to a user's email or via a direct link. When accepted, the user immediately gains the defined role.
2. **Group Invitations / Organization Join Requests (`useRequestToAccessOrganization`)**: Open or restricted invitations (often public links) that allow users to request access to an organization. Depending on the configuration, these might be automatically approved or sent to organization owners for manual review.
3. **Permission Requests (`useSubmitPermissionRequest`)**: A generalized action where a user requests access to a specific resource (often tied to group invitations internally).

## Core Components

The handling of invitations involves several cooperative components:

- **`InvitationCheck.tsx`**: A standalone React component mounted near the app root. It acts as an observer for routing state and local storage. Whenever the user is authenticated and is not missing mandatory profile fields, it checks for pending invitation tokens and fires the corresponding request hooks.
- **`AuthLoginCompleted.tsx` / `OauthLoginCompleted.tsx`**: Auth callback components that explicitly trigger `checkAndRequest` from the organization request hooks immediately after the user logs in, bypassing the need to wait for router transitions.
- **Hooks**: Encapsulate the complex logic of checking preconditions (like Terms of Service), displaying confirmation dialogs, firing API mutations, and handling errors.
