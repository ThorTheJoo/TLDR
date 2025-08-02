# TLDR App Setup Guide

## Prerequisites

Before running the TLDR app, you need to install the following:

### 1. Node.js and npm
Download and install Node.js from [https://nodejs.org/](https://nodejs.org/) (LTS version recommended)

### 2. Expo CLI
After installing Node.js, install Expo CLI globally:
```bash
npm install -g @expo/cli
```

### 3. Mobile Device or Emulator
- **iOS**: Install Xcode (Mac only) or use Expo Go app
- **Android**: Install Android Studio or use Expo Go app
- **Web**: No additional setup required

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```

3. **Run on Different Platforms**
   - **Web**: Press `w` in the terminal or visit the URL shown
   - **iOS**: Press `i` in the terminal (requires Xcode)
   - **Android**: Press `a` in the terminal (requires Android Studio)
   - **Expo Go**: Scan the QR code with your phone

## Project Structure

```
TLDR/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   ├── store/              # Redux store and slices
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── assets/                 # Images and static files
├── App.tsx                 # Main app component
├── package.json            # Dependencies and scripts
└── app.json               # Expo configuration
```

## Features to Test

### WhatsApp Integration
1. **Add Configuration**: Go to WhatsApp tab → Add button
2. **Configure Settings**: Enter name, phone number, API key
3. **Test Connection**: Use the "Test Connection" button
4. **View Messages**: Click "View Messages" on any config
5. **Manage Messages**: Search, filter, delete messages

### Mock Data
The app uses mock data for testing:
- 2 sample WhatsApp configurations
- Sample messages with different statuses
- Simulated API responses

## Development Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web

# Run tests
npm test

# Lint code
npm run lint
```

## Troubleshooting

### Common Issues

1. **Node.js not found**: Install Node.js from [nodejs.org](https://nodejs.org/)
2. **Expo CLI not found**: Run `npm install -g @expo/cli`
3. **Dependencies not installed**: Run `npm install`
4. **Metro bundler issues**: Clear cache with `npx expo start --clear`

### TypeScript Errors
The app may show TypeScript errors until dependencies are installed. These will resolve after running `npm install`.

## Git Setup

The project is ready for Git with:
- `.gitignore` configured for React Native/Expo
- TypeScript configuration
- ESLint setup for code quality
- Proper project structure

## Next Steps

1. Install Node.js and npm
2. Run `npm install` to install dependencies
3. Run `npm start` to launch the app
4. Test the WhatsApp integration features
5. Explore the UI and navigation

The app is fully functional with mock data and ready for testing! 