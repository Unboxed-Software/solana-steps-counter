import {
	Program,
	AnchorProvider as Provider,
	setProvider,
} from '@project-serum/anchor'
import {AnchorCounter, IDL} from '../../anchor-counter'
import {Keypair, PublicKey} from '@solana/web3.js'
import {
	ReactNode,
	createContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
	useContext,
} from 'react'
import {useConnection} from './ConnectionProvider'

export type AnchorContextType = {
	program: Program<AnchorCounter> | null
	counterAddress: PublicKey | null
}

export const AnchorContext = createContext<AnchorContextType>({
	program: null,
	counterAddress: null,
})

export const AnchorProvider = ({children}: {children: ReactNode}) => {
	const {connection} = useConnection()
	const [program, setProgram] = useState<Program<AnchorCounter> | null>(null)
	const [counterAddress, setCounterAddress] = useState<PublicKey | null>(null)

	const setup = useCallback(async () => {
		const program = new PublicKey(
			'ALeaCzuJpZpoCgTxMjJbNjREVqSwuvYFRZUfc151AKHU'
		)

		const MockWallet = {
			signTransaction: () => Promise.reject(),
			signAllTransactions: () => Promise.reject(),
			publicKey: Keypair.generate().publicKey,
		}

		const provider = new Provider(connection, MockWallet, {})
		setProvider(provider)

		const programInstance = new Program<AnchorCounter>(
			IDL,
			program,
			provider
		)
		setProgram(programInstance)

		const [newCounterAddress] = PublicKey.findProgramAddressSync(
			[Buffer.from('counter')],
			program
		)
		setCounterAddress(newCounterAddress)
	}, [connection])

	useEffect(() => {
		setup()
	}, [setup])

	const value = useMemo(
		() => ({
			program,
			counterAddress,
		}),
		[program, counterAddress]
	)

	return (
		<AnchorContext.Provider value={value}>
			{children}
		</AnchorContext.Provider>
	)
}

export const useProgram = () => useContext(AnchorContext)
