<template>
  <q-layout view="lHh Lpr lFf">
    <div class="nabvar">
      <nav class="deep-purple darken-1">
        <div class="container">
          <router-link to="/" class="text-h5 title">GeoNinjas!</router-link>
          <ul class="right">
            <li v-if="!user"><router-link to="/signup">Signup</router-link></li>
            <li v-if="!user"><router-link to="/login">Login</router-link></li>
            <li v-if="user">{{ user.email }}</li>
            <li v-if="user"><a @click="logout">Logout</a></li>
          </ul>
        </div>
      </nav>
    </div>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted, inject } from "vue";
import { fireAuth, fireDB } from "src/boot/firebase";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();

    const store = inject("store");

    const user = ref(null);
    const drawer = ref(false);

    onMounted(() => {
      fireAuth.onAuthStateChanged((_user) => {
        if (_user) user.value = _user;
        if (!_user) user.value = null;
      });
    });

    const logout = () => {
      // get current user
      // store.methods.handleAuthStateChanged();
      // let user = store.state.user;
      let user = fireAuth.currentUser
      console.log('current user before logout', user)

      fireDB
        .collection("ninjas")
        .where("user_id", "==", user.uid)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            fireDB
              .collection("ninjas")
              .doc(doc.id)
              .update({
                geolocation: {
                  lat: 0,
                  lng: 0,
                },
                online: false,
              })
              .then(() => {
                // store.state.lat = 0
                // store.state.lng = 0
                // router.push('/')
              });
          });
        })
        .then(() => {
          fireAuth.signOut().then(() => {
            console.log("user logout successfully !");
            // router.push("/");
            router.push("/login");
          });
        });
    };

    return {
      user,
      logout,
      drawer,
    };
  },
});
</script>

<style scoped>
.title {
  line-height: 64px;
}
.row {
  margin-bottom: 0;
}
span.q-btn_content {
  margin-bottom: 0;
  border: 1px solid red;
}
q-btn {
}
</style>
