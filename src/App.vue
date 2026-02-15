<script setup lang="ts">
import ConnectWalletBtn from './components/ConnectWalletBtn.vue';
import BalanceCard from './components/BalanceCard.vue';
</script>

<template>
  <div class="container">
    <header>
      <div class="logo-area">
        <h1>Web3 Connect</h1>
      </div>
      <ConnectWalletBtn />
    </header>

    <main>
      <div class="hero">
        <h2>Connect your wallet<br><span class="accent">to view real-time balances</span></h2>
        <p class="subtitle">Securely connect with MetaMask to check your ETH and USDT holdings on Ethereum Mainnet.</p>
      </div>
      
      <BalanceCard />
    </main>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 4rem;
}

.logo-area h1 {
  font-weight: 800;
  font-size: 1.5rem;
  background: linear-gradient(315deg, #42d392 25%, #647eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.hero {
  text-align: center;
  margin-bottom: 2rem;
}

.hero h2 {
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.hero .accent {
  background: linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero .subtitle {
  font-size: 1.2rem;
  color: var(--vt-c-text-dark-2, #888);
  max-width: 600px;
  margin: 0 auto;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .hero h2 {
    font-size: 2rem;
  }
}
</style>
