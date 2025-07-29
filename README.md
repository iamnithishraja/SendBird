# Welcome to your Chat App👋

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npm run ios-dev
   ```
## Auth Implimentation (very basic version can be improved by replacing it with JWT auth)

The app uses a modular architecture with separate services for authentication logic and cross-platform storage. The AuthService handles user data persistence using UUID for unique identification, while the Store class abstracts platform-specific storage (SecureStore for native, localStorage for web). The routing flow automatically redirects users between credentials and home screens based on authentication state, ensuring a seamless experience with proper navigation guards to prevent unauthorized access.

## sendbird implimentation
joins general channel or creates a new channel if it doesn't exist and send invite to all users also on startup or even invite is receved on startup from other users the user will be added to the channel or private chat the private chat id is just sha256 of the user id1 and user id2, event handlers for message sent, received, and read receipt. react hooks for managing channels, messages, and loading state.


## scalabality challenges
- pagination:- sendbird sdk provides pagination for messages but currently we fetch all the messages of the channel on startup, this can be improved by fetching messages in batches and implementing infinite scrolling.

- performance:- for large channels with many messages, the current implementation may cause performance issues. we can optimize this by implementing virtualization for the messages list and lazy loading of message content.

- state management:- the current implementation uses react hooks for managing state, which may not be suitable for large-scale applications. we can consider using a state management library like Zustand or recoil for more complex state management scenarios.

- ui and ux:- the current implementation uses a basic ui with a flat list for messages. we can improve the ui and ux by implementing features like message typing indicators, message status indicators, and message selection. we can also consider using a third-party library like React Native Elements or React Native Paper for more advanced ui components.

- auth:- the current implementation uses a basic auth system with uuid for user identification. we can improve this by implementing a more robust auth system using JWT tokens and secure storage for user credentials.

 - backend:- to currently manage channels we use sha256 of the channel name as the channel url, this can be improved by using a more robust backend system with a database for channel management.
