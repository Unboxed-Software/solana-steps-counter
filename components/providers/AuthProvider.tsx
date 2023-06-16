import {
	Account as AuthorizedAccount,
	AuthToken,
	AuthorizationResult,
	AuthorizeAPI,
	Base64EncodedAddress,
	DeauthorizeAPI,
	ReauthorizeAPI,
} from '@solana-mobile/mobile-wallet-adapter-protocol'
import {PublicKey} from '@solana/web3.js'
import {createContext, useCallback, useState, useMemo, useContext} from 'react'
import {toUint8Array} from 'js-base64'

export const AuthUtils = {
	getPubFromAddress: (address: Base64EncodedAddress) => {
		return new PublicKey(toUint8Array(address))
	},

	getAccountFromAuth: (authAccount: AuthorizedAccount): Account => {
		return {
			address: authAccount.address,
			label: authAccount.label,
			publicKey: AuthUtils.getPubFromAddress(authAccount.address),
		}
	},

	getAuthFromResult: (
		authResult: AuthorizationResult,
		previousAccount?: Account
	): Authorization => {
		let selectedAccount: Account
		if (
			previousAccount == null ||
			!authResult.accounts.some(
				(account) => account.address === previousAccount.address
			)
		) {
			const firstAccount = authResult.accounts[0]
			selectedAccount = AuthUtils.getAccountFromAuth(firstAccount)
		} else {
			selectedAccount = previousAccount
		}

		return {
			accounts: authResult.accounts.map(AuthUtils.getAccountFromAuth),
			authToken: authResult.auth_token,
			selectedAccount,
		}
	},
}

export type Account = Readonly<{
	address: Base64EncodedAddress
	label?: string
	publicKey: PublicKey
}>

type Authorization = Readonly<{
	accounts: Account[]
	authToken: AuthToken
	selectedAccount: Account
}>

export const AppIdentity = {
	name: 'Steps Incrementer',
}

export type AuthContextType = {
	accounts: Account[] | null
	authorizeSession: (
		wallet: AuthorizeAPI & ReauthorizeAPI
	) => Promise<Account>
	deauthorizeSession: (wallet: DeauthorizeAPI) => void
	onChangeAccount: (nextSelectedAccount: Account) => void
	selectedAccount: Account | null
}

const AuthContext = createContext<AuthContextType>({
	accounts: null,
	authorizeSession: (_wallet: AuthorizeAPI & ReauthorizeAPI) => {
		throw new Error('Provider not initialized')
	},
	deauthorizeSession: (_wallet: DeauthorizeAPI) => {
		throw new Error('Provider not initialized')
	},
	onChangeAccount: (_nextSelectedAccount: Account) => {
		throw new Error('Provider not initialized')
	},
	selectedAccount: null,
})

export type AuthProps = {
	children: React.ReactNode
	cluster: 'devnet' | 'mainnet-beta' | 'testnet'
}

export const AuthProvider = (props: AuthProps) => {
	const [authorization, setAuthorization] = useState<Authorization | null>(
		null
	)

	const handleAuthorizationResult = useCallback(
		async (authResult: AuthorizationResult): Promise<Authorization> => {
			const nextAuth = AuthUtils.getAuthFromResult(
				authResult,
				authorization?.selectedAccount
			)
			setAuthorization(nextAuth)

			return nextAuth
		},
		[authorization, setAuthorization]
	)

	const authorizeSession = useCallback(
		async (_wallet: AuthorizeAPI & ReauthorizeAPI): Promise<Account> => {
			const authResult = await (authorization
				? _wallet.reauthorize({
						auth_token: authorization.authToken,
						identity: AppIdentity,
				  })
				: _wallet.authorize({
						cluster: props.cluster,
						identity: AppIdentity,
				  }))

			return (await handleAuthorizationResult(authResult)).selectedAccount
		},
		[authorization, handleAuthorizationResult]
	)

	const deauthorizeSession = useCallback(
		async (_wallet: DeauthorizeAPI) => {
			if (authorization?.authToken == null) {
				return
			}
			await _wallet.deauthorize({auth_token: authorization.authToken})
			setAuthorization(null)
		},
		[authorization, setAuthorization]
	)

	const onChangeAccount = useCallback(
		(nextAccount: Account) => {
			setAuthorization((currentAuth) => {
				if (
					!currentAuth?.accounts.some(
						(account) => account.address === nextAccount.address
					)
				) {
					throw new Error(
						`${nextAccount.address} is no longer authorized`
					)
				}

				return {...currentAuth, selectedAccount: nextAccount}
			})
		},
		[setAuthorization]
	)

	const value = useMemo(
		(): AuthContextType => ({
			accounts: authorization?.accounts ?? null,
			authorizeSession,
			deauthorizeSession,
			onChangeAccount,
			selectedAccount: authorization?.selectedAccount ?? null,
		}),
		[authorization, authorizeSession, deauthorizeSession, onChangeAccount]
	)

	return (
		<AuthContext.Provider value={value}>
			{props.children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
