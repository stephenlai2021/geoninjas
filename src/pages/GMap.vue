<template>
  <q-page>
    <div class="google-map" id="map"></div>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { fireAuth, fireDB } from "src/boot/firebase";

export default defineComponent({
  setup() {
    const lat = ref(0);
    const lng = ref(0);
    const map = ref(null);

    const renderMap = () => {
      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: lat.value, lng: lng.value },
        zoom: 6,
        maxZoom: 20,
        minZoom: 3,
        streetViewControl: false,
      });

      // find and place markders on all online ninjas   
      fireDB
        .collection("ninjas")
        .where("online", "==", true)
        // .get()
        // .then((snapshot) => {
        .onSnapshot((snapshot) => {
          snapshot.forEach((doc) => {
            let data = doc.data();
            if (data.geolocation) {
              let marker = new google.maps.Marker({
                position: {
                  lat: data.geolocation.lat,
                  lng: data.geolocation.lng,
                },
                map,
              });
              // add click event to marker
              marker.addListener("click", () => {
                console.log("user id: ", doc.id);
              });
            }
          });
        });
    };

    onMounted(() => {
      // get current user
      fireAuth.onAuthStateChanged((user) => {
        if (user) {
          console.log("current user | GMap: ", user);

          // get user geolocation
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                lat.value = pos.coords.latitude;
                lng.value = pos.coords.longitude;

                // update ninja geolocation
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
                            lat: lat.value,
                            lng: lng.value,
                          },
                        });
                    });
                  })
                  .then(() => {
                    renderMap();
                  });

                // find all online ninjas and then update geocoords
                // fireDB
                //   .collection("ninjas")
                //   .where("online", "==", true)
                //   .get()
                //   .then((snapshot) => {
                //     snapshot.forEach((doc) => {
                //       console.log('online ninja id: ', doc.id)
                //       fireDB
                //         .collection("ninjas")
                //         .doc(doc.id)
                //         .update({
                //           geolocation: {
                //             lat: lat.value,
                //             lng: lng.value,
                //           },
                //         });
                //     });
                //   })                  
                //   .then(() => {
                //     renderMap();
                //   });
              },
              (err) => {
                console.log(err);
                renderMap();
              },
              { maximumAge: 60000, timeout: 3000 }
            );
          } else {
            // position center by default value
            console.log('there is no user logged in | GMap')
            // lat.value = null
            // lng.value = null
            renderMap();            
          }
        }
      });
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
