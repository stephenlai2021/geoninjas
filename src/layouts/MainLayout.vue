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
import { defineComponent, ref, onMounted } from "vue";
import { fireAuth, fireDB } from "src/boot/firebase";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();

    const user = ref(null);

    onMounted(() => {
      fireAuth.onAuthStateChanged((_user) => {
        if (_user) user.value = _user;
        if (!_user) user.value = null;
      });
    });

    const logout = () => {
      // get current user
      // let user = fireAuth.currentUser

      fireAuth.onAuthStateChanged((user) => {
        if (user) {
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
                  });
              });
            })
            .then(() => {
              fireAuth.signOut().then(() => {
                console.log("user logout | menu");
                router.push("/login");
              });
            });
        }
      });
    };

    return {
      user,
      logout,
    };
  },
});
</script>

<style scoped>
.title {
  line-height: 64px;
}
</style>
