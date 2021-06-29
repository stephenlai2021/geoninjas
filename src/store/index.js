import { reactive } from 'vue'
import { fireAuth, fireDB } from 'src/boot/firebase';

const state = reactive({
  user: null
})

const methods = {
  handleAuthStateChanged() {
    fireAuth.onAuthStateChanged((user) => {
      if (user) {
        state.user = fireAuth.currentUser;
        console.log("current user id | store: ", state.user.uid);
      }
    });
  }
}

export default {
  state,
  methods
}