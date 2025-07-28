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

