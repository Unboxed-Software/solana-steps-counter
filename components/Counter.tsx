import {View, Text, StyleSheet} from 'react-native'
import {useConnection} from './providers/ConnectionProvider'
import {useProgram} from './providers/AnchorProvider'
import {IdlAccounts} from '@project-serum/anchor'
import {AnchorCounter} from '../anchor-counter'
import {useEffect, useState} from 'react'
import {AccountInfo} from '@solana/web3.js'

const counterStyle = StyleSheet.create({
	counter: {
		fontSize: 48,
		fontWeight: 'bold',
		color: 'black',
		textAlign: 'center',
	},
})

type Counter = IdlAccounts<AnchorCounter>['counter']

const Counter = () => {
	const {connection} = useConnection()
	const {program, counterAddress} = useProgram()
	const [counter, setCounter] = useState<Counter>()

	useEffect(() => {
		console.log('counter: ' + program?.programId + ' ' + counterAddress)
		if (!program || !counterAddress) return
		const fetchState = async () => {
			const counterState = await program?.account.counter.fetch(
				counterAddress
			)
			setCounter(counterState)
		}

		fetchState()

		const subscriptionId = connection.onAccountChange(
			counterAddress,
			(accountInfo: AccountInfo<Buffer>) => {
				try {
					const data = program.coder.accounts.decode(
						'counter',
						accountInfo.data
					)
					setCounter(data)
				} catch (e) {
					console.log('account decoding error: ' + e)
				}
			}
		)

		return () => {
			connection.removeAccountChangeListener(subscriptionId)
		}
	}, [program, counterAddress, connection])

	return (
		<View>
			<Text>Current counter</Text>
			<Text style={counterStyle.counter}>
				{counter?.count.toString()}
			</Text>
		</View>
	)
}

export default Counter
