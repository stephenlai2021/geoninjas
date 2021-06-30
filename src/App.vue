<template>
  <router-view />
</template>

<script>
import { defineComponent, onMounted, provide } from "vue";
import { fireAuth } from "src/boot/firebase";
import store from './store'

export default defineComponent({
  setup() {
    provide("store", store);

    // onMounted(() => {
    //   fireAuth.onAuthStateChanged(user => {
    //     if (user) {
    //       console.log('current user | App.vue: ', user)
    //     }
    //   })

    //   // store.methods.handleAuthStateChanged();
    // });
  },
});
</script>
