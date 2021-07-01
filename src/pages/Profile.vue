<template>
  <div class="profile container">
    <div v-if="profile" class="card">
      <h2 class="deep-purple-text center">{{ profile.alias }}'s Wall</h2>
      <ul class="comments collection">
        <li v-for="(comment, index) in store.state.comments" :key="index">
          <div class="deep-purple-text">{{ comment.from }}</div>
          <div class="grey-text text-darken-2">{{ comment.comment }}</div>
        </li>
      </ul>
      <!-- <form @submit.prevent="addComment"> -->
      <form>
        <div class="field">
          <label for="comment">Add a comment</label>
          <input
            for="text"
            id="comment"
            v-model="newComment"
            @keyup.enter="addComment"
          />
          <p v-if="feedback" class="red-text center">{{ feedback }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, inject, onMounted } from "vue";
import { fireDB } from "src/boot/firebase";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const profile = ref(null);
    const newComment = ref(null);
    const feedback = ref(null);
    const comments = ref([]);

    const store = inject("store");

    const route = useRoute();

    onMounted(() => {
      // get auth user
      store.methods.getAuthUser();

      // get profile data
      fireDB.collection("ninjas")
        .doc(route.params.id)
        .get()
        .then((doc) => {
          profile.value = doc.data();
        });

      // get all comments
      store.methods.getComments(route.params.id);
    });

    const addComment = () => {
      if (newComment.value) {
        feedback.value = null;

        const data = {
          to: route.params.id,
          from: store.state.authUser.alias,
          comment: newComment.value,
          time: Date.now()
        }

        store.methods.addComment(data);
        newComment.value = null

      } else {
        feedback.value = "You must enter a comment to add it";
      }
    };

    return {
      store,
      profile,
      newComment,
      feedback,
      addComment,
      comments,
    };
  },
});
</script>

<style scoped>
.profile .card {
  padding: 20px;
  margin-top: 60px;
}
.profile h2 {
  font-size: 2em;
  margin-top: 0;
}
.profile li {
  padding: 10px;
  border-bottom: 1px solid #eee;
}
</style>
