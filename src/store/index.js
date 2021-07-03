import { reactive } from "vue";
import { fireAuth, fireDB } from "src/boot/firebase";
import { userRouter } from 'vue-router'

const state = reactive({
  user: null,
  authUser: null,
  message: false,
  comments: [],
  logout: false,
  lat: 0,
  lng: 0,
});

const methods = {
  addComment(data) {
    fireDB
      .collection("ninja-comments")
      .add(data)
      .then(() => {
        state.message = true;
      });
    state.comments.unshift(data);
  },
  getAuthUser() {
    fireDB
      .collection("ninjas")
      .where("user_id", "==", state.user.uid)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          state.authUser = doc.data();
        });
      });
  },
  getComments(to) {
    fireDB
      .collection("ninja-comments")
      .where("to", "==", to) 
      .get()
      // .then((snapshot) => {
      .onSnapshot((snapshot) => {
        state.comments = snapshot.docs.map((doc) => {
          return { ...doc.data() };
        });
      });
  },
  handleAuthStateChanged() {
    fireAuth.onAuthStateChanged((user) => {
      if (user) {
        state.user = fireAuth.currentUser;
        console.log("current user id | store: ", state.user.uid);
      }
    });
  },
};

export default {
  state,
  methods,
};
