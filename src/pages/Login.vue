<template>
  <div class="login container">
    <form class="card-panel">
      <h2 class="center deep-purple-text">Login</h2>
      <div class="field">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" />
      </div>
      <div class="field">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" />
      </div>
      <p v-if="feedback" class="red-text center">{{ feedback }}</p>
      <div class="field center">
        <!-- <q-btn label="Login" color="primary" @click="login" /> -->
        <button class="btn deep-purple" @click="login">Login</button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineComponent, ref, inject } from "vue";
import { fireAuth, fireDB } from "src/boot/firebase";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const email = ref(null);
    const password = ref(null);
    const feedback = ref(null);

    const router = useRouter();

    const store = inject("store");

    const login = () => {
      if (email.value && password.value) {
        // fireDB.collection('ninjas').
        fireAuth
          .signInWithEmailAndPassword(email.value, password.value)
          .then((cred) => {
            console.log("current user | login: ", cred.user);

            store.state.user = cred.user
            console.log("current user | store: ", store.state.user);

            fireDB
              .collection("ninjas")
              .where("user_id", "==", cred.user.uid)
              .get()
              .then((snapshot) => {
                snapshot.forEach((doc) => {
                  fireDB.collection("ninjas").doc(doc.id).update({
                    online: true,
                  });
                });
              }).then(() => {
                router.push("/");
              })
          })
          .catch((err) => {
            feedback.value = err.message;
          });
        feedback.value = null;
      } else {
        feedback.value = "Please fill in both fields";
      }
    };

    return {
      email,
      password,
      feedback,
      login,
    };
  },
});
</script>

<style scoped>
.login {
  max-width: 400px;
  margin-top: 60px;
}
.login h2 {
  font-size: 2.4em;
}
.login .field {
  margin-bottom: 16px;
}
</style>
