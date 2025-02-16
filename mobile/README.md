# Mobile Store App

A React Native mobile application for the Moxium e-commerce platform. This app allows customers to browse products, manage their cart, place orders, and view their order history.

## Features

- **Authentication**
  - Login/Register functionality
  - Secure token management
  - Profile management

- **Product Management**
  - Browse products with infinite scroll
  - View product details
  - Search products
  - View by categories

- **Shopping Cart**
  - Add/remove items
  - Update quantities
  - View cart summary

- **Orders**
  - Place orders
  - View order history
  - View order details
  - Track order status

- **Profile Management**
  - Update profile information
  - View order history
  - Manage settings

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     API_BASE_URL=your_api_url
     STORE_ID=your_store_id
     ```

3. Run the development server:
   ```bash
   npm start
   ```

4. Run on iOS:
   ```bash
   npm run ios
   ```

5. Run on Android:
   ```bash
   npm run android
   ```

## Project Structure

- `/src`
  - `/components` - Reusable UI components
  - `/screens` - Screen components
  - `/hooks` - Custom React hooks
  - `/utils` - Utility functions
  - `/contexts` - React Context providers
  - `/types` - TypeScript type definitions
  - `/theme` - Theme configuration

## Technologies Used

- React Native
- Expo
- TypeScript
- @shopify/restyle for theming
- React Navigation
- Axios for API calls
- AsyncStorage for local storage

## API Integration

The app integrates with the Moxium API endpoints:

- `/api/storefront/[storeId]/products` - Product listings
- `/api/storefront/[storeId]/cart` - Cart management
- `/api/storefront/[storeId]/orders` - Order management
- `/api/storefront/[storeId]/auth` - Authentication
- `/api/storefront/[storeId]/profile` - Profile management

## Build and Deploy

1. Configure app.json with your app details

2. Build for iOS:
   ```bash
   expo build:ios
   ```

3. Build for Android:
   ```bash
   expo build:android
   ```

4. Submit to stores:
   - Follow Expo's documentation for app store submission
   - Update privacy policy and terms of service
   - Prepare store listings and screenshots

## Security

- Implements secure token-based authentication
- Stores sensitive data in AsyncStorage
- Uses HTTPS for all API calls
- Implements proper error handling

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.