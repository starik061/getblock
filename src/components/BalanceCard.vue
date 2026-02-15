<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet';
import { storeToRefs } from 'pinia';

const store = useWalletStore();
const { ethBalance, usdtBalance, isConnected, chainId } = storeToRefs(store);
const { switchNetwork } = store;
</script>

<template>
  <transition name="fade">
    <div v-if="isConnected" class="balance-card">
      <div v-if="chainId !== '1'" class="network-warning">
        <p>⚠️ Wrong Network</p>
        <button @click="switchNetwork" class="switch-btn">Switch to Mainnet</button>
      </div>
      
      <div v-else class="balances">
        <div class="balance-item">
          <span class="label">ETH Balance</span>
          <span class="value">{{ ethBalance ?? '...' }}</span>
        </div>
        <div class="divider"></div>
        <div class="balance-item">
          <span class="label">USDT Balance</span>
          <span class="value">{{ usdtBalance ?? '...' }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.balance-card {
  background: var(--vt-c-black-soft, #1a1a1a);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  margin-top: 32px;
  width: 100%;
  max-width: 480px;
  text-align: center;
  border: 1px solid var(--vt-c-divider-dark-2, #333);
}

.network-warning {
  color: #ffca28;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.network-warning p {
  margin: 0;
  font-weight: 600;
}

.switch-btn {
  background: #ffca28;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.switch-btn:hover {
  background: #ffd54f;
}

.balances {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.balance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.label {
  font-size: 0.85rem;
  color: var(--vt-c-text-dark-2, #888);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vt-c-text-dark-1, #fff);
  font-variant-numeric: tabular-nums;
}

.divider {
  width: 1px;
  height: 50px;
  background: var(--vt-c-divider-dark-2, #444);
  margin: 0 16px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
