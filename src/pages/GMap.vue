<template>
  <q-page>
    <div class="google-map" id="map"></div>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref, inject } from "vue";
import { fireAuth, fireDB } from "src/boot/firebase";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const lat = ref(0);
    const lng = ref(0);
    const map = ref(null);
    const user = ref(null);

    const store = inject("store");

    const router = useRouter();

    const renderMap = () => {
      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: lat.value, lng: lng.value },
        // center: { lat: store.state.lat, lng: store.state.lng },
        zoom: 3,
        maxZoom: 20,
        minZoom: 3,
        streetViewControl: false,
      });

      // find and place markders on all online ninjas
      fireDB
        .collection("ninjas")
        .where("online", "==", true)
        .onSnapshot((snapshot) => {
          snapshot.forEach((doc) => {
            let data = doc.data();
            if (data.geolocation) {
              // store.state.lat = data.geolocation.lat
              // store.state.lng = data.geolocation.lng

              const infowindow = new google.maps.InfoWindow({
                content: data.alias,
                // content: 'hi, there !'
              });

              let marker = new google.maps.Marker({
                position: {
                  lat: data.geolocation.lat,
                  lng: data.geolocation.lng,
                  // lat: store.state.lat,
                  // lng: store.state.lng,
                },
                // icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
                // title: "Hello World!",
                label: {
                  text: data.alias.charAt(0).toUpperCase(),
                  color: "white",
                },
                map,
              });
              // add click event to marker
              marker.addListener("click", () => {
                infowindow.open({
                  anchor: marker,
                  map,
                  shouldFocus: false,
                });

                // console.log("user id: ", doc.id);
                // router.push(`/profile/${doc.data().alias}`)

                map.setZoom(5);
                map.setCenter(marker.getPosition());
              });
            }
          });
        });
    };

    onMounted(() => {
      // get current user
      store.methods.handleAuthStateChanged();
      user.value = store.state.user;

      renderMap();

      // if (user.value) {
      console.log("current user | store in GMap: ", user.value);

      // get user geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            lat.value = pos.coords.latitude;
            lng.value = pos.coords.longitude;
            // store.state.lat = pos.coords.latitude;
            // store.state.lng = pos.coords.longitude;

            fireDB
              .collection("ninjas")
              .where("user_id", "==", user.value.uid)
              .get()
              .then((snapshot) => {
                snapshot.forEach((doc) => {
                  fireDB
                    .collection("ninjas")
                    .doc(doc.id)
                    .update({
                      geolocation: {
                        lat: lat.value,
                        lng: lng.value,
                      },
                    });
                });
              })
              .then(() => {
                renderMap();
              });
          },
          (err) => {
            console.log(err);
            renderMap();
          }
        );
      } else {
        // position center by default value
        console.log("there is no user logged in | GMap");
        renderMap();
      }

      // }
    });

    return {
      map,
    };
  },
});
</script>

<style scoped>
.google-map {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  background: #fff;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
