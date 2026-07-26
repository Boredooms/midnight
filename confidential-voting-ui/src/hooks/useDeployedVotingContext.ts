import { useContext } from 'react';
import { DeployedVotingContext, type DeployedVotingAPIProvider } from '../contexts';

export const useDeployedVotingContext = (): DeployedVotingAPIProvider => {
  const context = useContext(DeployedVotingContext);
  if (!context) {
    throw new Error('useDeployedVotingContext must be used within a DeployedVotingProvider');
  }
  return context;
};
