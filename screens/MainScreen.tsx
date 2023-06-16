import {Slider, StyleSheet, Text, View} from 'react-native'
import {useState, useEffect} from 'react'
import ShakeEventListener from '../sensor/ShakeEventListener'
import Counter from '../components/Counter'
import {useAuth} from '../components/providers/AuthProvider'
import {useProgram} from '../components/providers/AnchorProvider'
import {useConnection} from '../components/providers/ConnectionProvider'
import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import {Transaction} from '@solana/web3.js'

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
})
const MainScreen = () => {
	const {authorizeSession} = useAuth()
	const {program, counterAddress} = useProgram()
	const {connection} = useConnection()
	const [transactionInProgress, setTransactoinInProgress] = useState(false)
	const [threshold, setThreshold] = useState(150)

	useEffect(() => {
		return () => {
			if (ShakeEventListener.hasAnyListeners()) {
				console.log('unsubscrbing')
				ShakeEventListener.removeListener()
			}
		}
	}, [])

	useEffect(() => {
		if (!ShakeEventListener.hasAnyListeners()) {
			ShakeEventListener.removeListener()
		}

		console.log('subscribing')

		ShakeEventListener.addListener(threshold, async () => {
			console.log('shake detected')
			if (!transactionInProgress) {
				await incrementCounter()
			}
		})
	}, [program, counterAddress, threshold])

	const incrementCounter = async () => {
		console.log('in increment')

		setTransactoinInProgress(true)
		if (!program || !counterAddress) {
			console.log('returning from if')
			setTransactoinInProgress(false)
			return
		}

		return await transact(async (wallet) => {
			try {
				console.log('in transact')
				const [authResult, latestBlockhashResult] = await Promise.all([
					authorizeSession(wallet),
					connection.getLatestBlockhash(),
				])

				const instruction = await program.methods
					.increment()
					.accounts({
						counter: counterAddress,
						user: authResult.publicKey,
					})
					.instruction()

				const transaction = new Transaction({
					...latestBlockhashResult,
					feePayer: authResult.publicKey,
				}).add(instruction)

				const signature = await wallet.signAndSendTransactions({
					transactions: [transaction],
				})

				console.log(
					'Transaction successful with signature: ' + signature
				)
			} catch (err) {
				console.log('err' + err)
			} finally {
				setTransactoinInProgress(false)
			}
		})
	}

	return (
		<View style={styles.container}>
			<Slider
				style={{width: '100%'}}
				value={150}
				maximumValue={1000}
				minimumValue={50}
				onValueChange={(value) => setThreshold(value)}
			/>
			<Text>Current threshold: {threshold}</Text>
			<Text style={{fontSize: 14, color: 'gray', margin: 8}}>
				Increase the threshold to lower the sensitivity of shaking and
				vice versa
			</Text>
			<Counter />
		</View>
	)
}

export default MainScreen
