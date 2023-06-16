import {Pressable, StyleSheet, Text} from 'react-native'
import {useAuth} from './providers/AuthProvider'
import {useProgram} from './providers/AnchorProvider'
import {useConnection} from './providers/ConnectionProvider'
import {
	transact,
	Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import {Transaction} from '@solana/web3.js'

export type FloatingActionButtonProps = {
	title: string
	backgroundColor?: string
	textColor: string
}

const floatingActionButtonStyle = StyleSheet.create({
	container: {
		height: 64,
		width: 64,
		alignItems: 'center',
		borderRadius: 40,
		justifyContent: 'center',
		elevation: 4,
	},

	text: {
		fontSize: 24,
	},
})

const FloatingActionButton = (props: FloatingActionButtonProps) => {
	const {authorizeSession} = useAuth()
	const {program, counterAddress} = useProgram()
	const {connection} = useConnection()

	const createAndSubmitTransaction = async () => {
		if (!program || !counterAddress) return
		return await transact(async (wallet: Web3MobileWallet) => {
			const [authResult, latestBlockhashResult] = await Promise.all([
				authorizeSession(wallet),
				connection.getLatestBlockhash(),
			])

			const transactionInstruction = await program.methods
				.increment()
				.accounts({counter: counterAddress, user: authResult.publicKey})
				.instruction()

			const transaction = new Transaction({
				...latestBlockhashResult,
				feePayer: authResult.publicKey,
			}).add(transactionInstruction)

			const signature = await wallet.signAndSendTransactions({
				transactions: [transaction],
			})

			console.log('Signature: ' + signature)
		})
	}

	return (
		<Pressable
			style={{
				...floatingActionButtonStyle.container,
				backgroundColor: props.backgroundColor ?? 'blue',
			}}
			onPress={async () => await createAndSubmitTransaction()}>
			<Text
				style={{
					...floatingActionButtonStyle.text,
					color: props.textColor ?? 'white',
				}}>
				{props.title}
			</Text>
		</Pressable>
	)
}

export default FloatingActionButton
