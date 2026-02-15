# Detailed Implementation Plan: Wallet Connection Landing Page

## 1. Project Setup
- **Initialize Project**: Create a new Vue 3 project using Vite.
  - Command: `npm create vue@latest` (Select: TypeScript, Pinia, ESLint, Prettier).
- **Clean Up**: Remove default boilerplate code.

## 2. Dependencies & Tools
- **Framework**: Vue 3 (Composition API, `<script setup>`).
- **Styling**: Standard CSS / SCSS (Keep it lightweight and simple).
- **Web3 Library**: `ethers` (v6) - Standard choice.
- **State Management**: Pinia.

## 3. Architecture & State Management
- **Wallet Store (`src/stores/wallet.ts`)**:
  - **State**:
    - `account`: string | null
    - `chainId`: string | null
    - `ethBalance`: string | null
    - `usdtBalance`: string | null
    - `isConnecting`: boolean
    - `error`: string | null
  - **Actions**:
    - `connect()`: Requests account access from MetaMask.
    - `disconnect()`: Resets state.
    - `fetchBalances()`: Retrieves ETH and USDT balances.
    - `checkConnection()`: Checks if already connected on mount.
    - `switchNetwork()`: Requests switch to Ethereum Mainnet if on wrong chain (Essential for accurate balance checks).

## 4. Key Functionality Implementation
### 4.1 Wallet Connection
- Check for `window.ethereum`.
- Handle `eth_requestAccounts`.
- Setup event listeners: `accountsChanged`, `chainChanged`.
- **Network Switching**: If chainId !== 1 (Mainnet), prompt user to switch via `wallet_switchEthereumChain`.

### 4.2 Balance Fetching
- **ETH Balance**: Use `provider.getBalance(address)`.
- **USDT Balance**:
  - **Contract Address**: `0xdAC17F958D2ee523a2206206994597C13D831ec7` (Mainnet).
  - **ABI**: Partial ABI containing `balanceOf` and `decimals`.
  - **Calculation**: formattedBalance = rawBalance / 10^decimals.

## 5. User Interface
### Components
- **App.vue**: Main entry.
- **ConnectWalletBtn.vue**:
  - Displays "Connect Wallet" or Address.
- **BalanceCard.vue**:
  - Semantic display of ETH and USDT balances.

### Design
- Clean, modern landing page style using custom CSS variables for effortless dark/light mode.
- Responsive flex/grid layout.

## 6. Deployment Strategy
- **Platform**: **Vercel**.
- **Process**:
  1.  Push code to GitHub.
  2.  Connect repository in Vercel.
  3.  Automatic deploy.
- **Build**: `npm run build`.

## 7. Step-by-Step Execution Plan
1.  **Init**: Initialize Vue + Vite project.
2.  **Deps**: Install `ethers`.
3.  **Store**: Implement `useWalletStore`.
4.  **Logic**: Implement connection, network switching, and balance fetching.
5.  **UI**: Build simple, responsive components.
6.  **Verify**: Test connection, network switching, and balance accuracy.
7.  **Build**: Run production build.
