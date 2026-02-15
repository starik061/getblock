import './assets/main.css'
import 'vue3-toastify/dist/index.css'
import './assets/toasts.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(Vue3Toastify, {
  autoClose: 3000,
  theme: 'light',
} as ToastContainerOptions)

app.mount('#app')
