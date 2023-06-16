import 'react-native-get-random-values'
import {v4 as uuidv4} from 'uuid'
import {LogBox} from 'react-native'
import {ConnectionProvider} from './components/providers/ConnectionProvider'
import {AuthProvider} from './components/providers/AuthProvider'
import {AnchorProvider} from './components/providers/AnchorProvider'
import * as web3 from '@solana/web3.js'
import MainScreen from './screens/MainScreen'
global.Buffer = require('buffer').Buffer

LogBox.ignoreAllLogs()

export default function App() {
	const endpoint = web3.clusterApiUrl('devnet')

	return (
		<ConnectionProvider
			endpoint={endpoint}
			config={{commitment: 'processed'}}>
			<AuthProvider cluster='devnet'>
				<AnchorProvider>
					<MainScreen />
				</AnchorProvider>
			</AuthProvider>
		</ConnectionProvider>
	)
}
