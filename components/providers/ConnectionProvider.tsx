import {Connection, ConnectionConfig} from '@solana/web3.js';
import {createContext, useContext, useMemo} from 'react';

export type ConnectionContextType = {
  connection: Connection;
};

type ConnectionProviderProps = {
  children: React.ReactNode;
  endpoint: string;
  config?: ConnectionConfig;
};

const ConnectionContext = createContext<ConnectionContextType>(
  {} as ConnectionContextType,
);

export const ConnectionProvider = (props: ConnectionProviderProps) => {
  const connection = useMemo(
    () => new Connection(props.endpoint, props.config),
    [props.endpoint, props.config],
  );

  return (
    <ConnectionContext.Provider value={{connection}}>
      {props.children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = (): ConnectionContextType =>
  useContext(ConnectionContext);
