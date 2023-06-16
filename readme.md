# Getting Started

## Setting up development environment

If you are using emulator, go through [android development environment](https://reactnative.dev/docs/environment-setup?platform=android&os=windows#target-os-1) and [iOS development environment setup](https://reactnative.dev/docs/environment-setup?platform=ios&os=macos#installing-dependencies) before proceeding.

## Creating new project

Create a new React Native project by running the following command

```shell
npx create-expo-app --template expo-template-blank-typescript
```

### Installing dependencies

Navigate to your project directory and install the necessary dependencies

```shell
npm install @solana-mobile/mobile-wallet-adapter-protocol @solana-mobile/mobile-wallet-adapter-protocol-web3js @solana/wallet-adapter-react @solana/web3.js @project-serum/anchor expo-sensors js-base64 assert buffer metro-core  react-native-get-random-values uuid
```

## Verify Installation

Before we can run our app on devices, here are a couple of necessary steps:

> App.tsx

    import 'react-native-get-random-values'

    import { v4 as uuidv4 } from 'uuid'

    ...other imports

    global.Buffer = require('buffer').Buffer

    LogBox.ignoreAllLogs()

    export default function App()...

> For the solana mobile wallet adapter to work with expo, we need to run the app using eas build. Follow this [link](https://docs.expo.dev/build/setup/) for the eas cli setup and checkout this [repo](https://github.com/solana-mobile/expo-react-native-mwa-proof-of-concept.git) for more info.

> Follow this [link](https://docs.expo.dev/build/setup/#run-a-build) to see how to run a eas build on devices.
