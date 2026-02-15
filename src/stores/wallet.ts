import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ethers } from 'ethers';

// USDT Contract Address on Ethereum Mainnet
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

// Minimal ABI for ERC20 Token (balanceOf, decimals)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export const useWalletStore = defineStore('wallet', () => {
  const account = ref<string | null>(null);
  const chainId = ref<string | null>(null);
  const ethBalance = ref<string | null>(null);
  const usdtBalance = ref<string | null>(null);
  const isConnecting = ref(false);
  const error = ref<string | null>(null);

  const isConnected = computed(() => !!account.value);
  const shortAddress = computed(() => {
    if (!account.value) return '';
    return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`;
  });

  // Helper: Get Ethereum Provider
  const getProvider = () => {
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
  };

  // Helper: Format Balance
  const formatBalance = (rawBalance: bigint, decimals: number = 18): string => {
    return ethers.formatUnits(rawBalance, decimals);
  };

  // Action: Switch Network to Ethereum Mainnet
  const switchNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Mainnet
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        error.value = 'Ethereum Mainnet is not configured in your wallet.';
      } else {
        console.error('Failed to switch network:', switchError);
        error.value = 'Failed to switch network. Please switch manually.';
      }
    }
  };

  // Action: Fetch Balances
  const fetchBalances = async () => {
    if (!account.value) return;

    try {
      const provider = getProvider();
      if (!provider) return;

      // Ensure we are on Mainnet for correct balances
      const network = await provider.getNetwork();
      chainId.value = network.chainId.toString();

      if (network.chainId !== 1n) {
        // If not on Mainnet, we can't fetch USDT from the mainnet address easily without a dedicated provider
        // But per requirements, we should display Mainnet balances. 
        // We will try to switch network first if connected?
        // Or just show prompts. For now, let's try to fetch what we can.
        // If wrong network, USDT call might fail or return 0 if address exists but is different contract on testnet.
        ethBalance.value = null;
        usdtBalance.value = null;
        return; 
      }

      // Fetch ETH Balance
      const rawEthBalance = await provider.getBalance(account.value);
      ethBalance.value = (+formatBalance(rawEthBalance)).toFixed(4);

      // Fetch USDT Balance
      const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
      
      // Check code at address to avoid errors if contract doesn't exist on this chain
      const code = await provider.getCode(USDT_ADDRESS);
      if (code === '0x') {
        usdtBalance.value = '0.00'; 
        return;
      }
      
      const rawUsdtBalance = await usdtContract.balanceOf(account.value);
      const decimals = await usdtContract.decimals();
      usdtBalance.value = (+formatBalance(rawUsdtBalance, decimals)).toFixed(2);

    } catch (err: any) {
      console.error('Error fetching balances:', err);
      error.value = 'Failed to fetch balances.';
    }
  };

  // Action: Connect Wallet
  const connect = async () => {
    isConnecting.value = true;
    error.value = null;

    try {
      const provider = getProvider();
      if (!provider) {
        error.value = 'MetaMask is not installed!';
        return;
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        account.value = accounts[0];
        await checkNetworkAndFetch();
      }
      
    } catch (err: any) {
      console.error('Connection error:', err);
      // EIP-1193 userRejectedRequest error
      if (err.code === 4001) {
        error.value = 'Please connect to MetaMask.';
      } else {
        error.value = 'Failed to connect wallet.';
      }
    } finally {
      isConnecting.value = false;
    }
  };

  // Action: Check Network and Fetch Balances
  const checkNetworkAndFetch = async () => {
      const provider = getProvider();
      if (!provider) return;

      const network = await provider.getNetwork();
      chainId.value = network.chainId.toString();

      if (network.chainId !== 1n) {
          await switchNetwork();
          // Re-check after switch attempt
          const newNetwork = await provider.getNetwork();
          chainId.value = newNetwork.chainId.toString();
      }

      if (chainId.value === '1') {
          await fetchBalances();
      } else {
          error.value = "Please switch to Ethereum Mainnet to see balances.";
      }
  };

  // Action: Disconnect
  const disconnect = () => {
    account.value = null;
    chainId.value = null;
    ethBalance.value = null;
    usdtBalance.value = null;
    error.value = null;
  };

  // Action: Init / Check Connection on Load
  const checkConnection = async () => {
    const provider = getProvider();
    if (!provider) return;

    try {
      const accounts = await provider.send('eth_accounts', []);
      if (accounts.length > 0) {
        account.value = accounts[0];
        await checkNetworkAndFetch();
      }

      // Setup Listeners
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            account.value = accounts[0];
            checkNetworkAndFetch();
          } else {
            disconnect();
          }
        });

        window.ethereum.on('chainChanged', () => {
          // recommended to reload on chain change, but we can handle it dynamically
          window.location.reload(); 
        });
      }

    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  return {
    account,
    chainId,
    ethBalance,
    usdtBalance,
    isConnecting,
    error,
    isConnected,
    shortAddress,
    connect,
    disconnect,
    checkConnection,
    switchNetwork,
  };
});
