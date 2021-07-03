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
  async logout() {
     try {
       // get current user
      //  const user = fireAuth.currentUser;
       const user = state.user;

       // set user online status to false
       await fireDB
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
         });
       console.log(`user: ${user} is logged out`);

       state.logout = true;

       // logout user
       await fireAuth.signOut();
     } catch (err) {
       console.log(`logout error: `, err.message);
     }
  },
  renderMap() {
  },
  getNinjasLocation() {
    // if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      state.lat = pos.coords.latitude;
      state.lng = pos.coords.longitude;

      fireDB
        .collection("ninjas")
        .where("user_id", "==", state.user.uid)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            fireDB
              .collection("ninjas")
              .doc(doc.id)
              .update({
                geolocation: {
                  lat: state.lat,
                  lng: state.lng,
                },
              });
          });
        });
    }, err => {
      console.log('error message: ', err.message)
    });
    // }
  },
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
      .then((snapshot) => {
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
