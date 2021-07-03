<template>
  <div class="signup container">
    <form class="card-panel" @submit.prevent="signup">
      <h2 class="center deep-purple-text">Signup</h2>
      <div class="field">
        <label for="email">Email:</label>
        <input type="text" id="email" v-model="email" />
      </div>
      <div class="field">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" />
      </div>
      <div class="field">
        <label for="alias">Alias:</label>
        <input type="text" id="alias" v-model="alias" />
      </div>
      <p v-if="feedback" class="red-text center">{{ feedback }}</p>
      <div class="field center">
        <button class="btn deep-purple">Signup</button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { fireAuth, fireDB } from "src/boot/firebase";
import slugify from "slugify";
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const email = ref(null);
    const password = ref(null);
    const alias = ref(null);
    const feedback = ref(null);

    const router = useRouter()

    // we use alias as document id
    const slug = ref(null);

    const signup = () => {
      if (alias.value && email.value && password.value) {
        // replace space with '-', turn upper case into lower case
        slug.value = slugify(alias.value, {
          replacement: "-",
          remove: /[$*_+~.()'"!\-:@]/g,
          lower: true,
        });
        console.log(slug.value);

        let ref = fireDB.collection("ninjas").doc(slug.value);
        ref.get().then((doc) => {
          if (doc.exists) {
            feedback.value = "This alias already exists";
          } else {
            feedback.value = "This alias is free to use";
            fireAuth
              .createUserWithEmailAndPassword(email.value, password.value)
              .then((cred) => {
                console.log("signup user: ", cred.user);
                ref.set({
                  alias: alias.value,
                  email: email.value,
                  geolocation: null,
                  online: true,
                  user_id: cred.user.uid,
                })
                
              }).then(() => {
                router.push('/')
              })
              .catch((err) => {
                console.log(err.message);
                feedback.value = err.message;
              });
          }
        });
      } else {
        feedback.value = "You must enter all fields";
      }
    };

    return {
      email,
      password,
      alias,
      feedback,
      slug,
      signup,
    };
  },
});
</script>

<style>
.signup {
  max-width: 400px;
  margin-top: 60px;
}
.signup h2 {
  font-size: 2.4em;
}
.signup .field {
  margin-bottom: 16px;
}
</style>
