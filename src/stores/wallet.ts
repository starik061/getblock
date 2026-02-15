import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ethers } from 'ethers';
import { toast } from 'vue3-toastify';

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
  // error state removed, using toasts

  const isConnected = computed(() => !!account.value);
  const shortAddress = computed(() => {
    if (!account.value) return '';
    return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`;
  });

  // Helper: Get Ethereum Provider
  const getProvider = () => {
    if ((window as any).ethereum) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    console.error('MetaMask (window.ethereum) not found!');
    return null;
  };

  // Helper: Format Balance
  const formatBalance = (rawBalance: bigint, decimals: number = 18): string => {
    return ethers.formatUnits(rawBalance, decimals);
  };

  // Action: Switch Network to Ethereum Mainnet
  const switchNetwork = async () => {
    if (!(window as any).ethereum) return;
    
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Mainnet
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        toast.error('Ethereum Mainnet is not configured in your wallet.');
      } else {
        console.error('Failed to switch network:', switchError);
        toast.error('Failed to switch network. Please switch manually.');
      }
    }
  };

  // Action: Fetch Balances
  const fetchBalances = async () => {
    if (!account.value) return;

    try {
      const provider = getProvider();
      if (!provider) return;

      const network = await provider.getNetwork();
      chainId.value = network.chainId.toString();

      if (network.chainId !== 1n) {
        ethBalance.value = null;
        usdtBalance.value = null;
        return; 
      }

      // Fetch ETH Balance
      const rawEthBalance = await provider.getBalance(account.value);
      ethBalance.value = (+formatBalance(rawEthBalance)).toFixed(4);

      // Fetch USDT Balance
      const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
      
      const code = await provider.getCode(USDT_ADDRESS);
      if (code === '0x') {
        usdtBalance.value = '0.00'; 
        return;
      }
      
      if (usdtContract && usdtContract.balanceOf && usdtContract.decimals) {
          const rawUsdtBalance = await usdtContract.balanceOf(account.value);
          const decimals = await usdtContract.decimals();
          usdtBalance.value = (+formatBalance(rawUsdtBalance, decimals)).toFixed(2);
      } else {
        const rawUsdtBalance = await usdtContract.getFunction('balanceOf').staticCall(account.value);
        const decimals = await usdtContract.getFunction('decimals').staticCall();
        usdtBalance.value = (+formatBalance(rawUsdtBalance, decimals)).toFixed(2);
      }

    } catch (err: any) {
      console.error('Error fetching balances:', err);
      toast.error('Failed to fetch balances.');
    }
  };

  // Action: Connect Wallet
  const connect = async () => {
    isConnecting.value = true;

    try {
      const provider = getProvider();
      if (!provider) {
        toast.error('MetaMask is not installed!');
        return;
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        account.value = accounts[0];
        toast.success('Wallet connected!');
        await checkNetworkAndFetch();
      }
      
    } catch (err: any) {
      console.error('Connection error detailed:', err);
      if (err.code === 4001) {
        toast.warn('Connection rejected by user.');
      } else {
        toast.error(`Failed to connect: ${err.message || err}`);
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
          const newNetwork = await provider.getNetwork();
          chainId.value = newNetwork.chainId.toString();
      }

      if (chainId.value === '1') {
          await fetchBalances();
      } else {
          toast.info("Please switch to Ethereum Mainnet to see balances.");
      }
  };

  // Action: Disconnect
  const disconnect = () => {
    account.value = null;
    chainId.value = null;
    ethBalance.value = null;
    usdtBalance.value = null;
    toast.info('Wallet disconnected');
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
      if ((window as any).ethereum) {
        (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            account.value = accounts[0] || null;
            checkNetworkAndFetch();
          } else {
            disconnect();
          }
        });

        (window as any).ethereum.on('chainChanged', () => {
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
    isConnected,
    shortAddress,
    connect,
    disconnect,
    checkConnection,
    switchNetwork,
  };
});
