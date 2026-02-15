<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet';
import { storeToRefs } from 'pinia';

const store = useWalletStore();
const { isConnected, shortAddress, isConnecting } = storeToRefs(store);
const { connect, disconnect } = store;
</script>

<template>
  <button 
    class="connect-btn"
    :class="{ connected: isConnected }"
    @click="isConnected ? disconnect() : connect()" 
    :disabled="isConnecting"
  >
    <span v-if="isConnecting" class="loader"></span>
    <span v-else>{{ isConnected ? shortAddress : 'Connect Wallet' }}</span>
  </button>
</template>

<style scoped>
.connect-btn {
  background: var(--vt-c-indigo, #646cff);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.connect-btn:hover:not(:disabled) {
  background: var(--vt-c-indigo-dark, #535bf2);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px rgba(0,0,0,0.15);
}

.connect-btn.connected {
  background: var(--vt-c-black-soft, #2f2f2f);
  border: 1px solid var(--vt-c-divider-dark-2, #444);
  color: var(--vt-c-text-dark-1, #fff);
}

.connect-btn.connected:hover {
  background: var(--vt-c-black-mute, #3a3a3a);
  border-color: #666;
}

.connect-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
