import { fireAuth } from 'src/boot/firebase'

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: 'GMap',
        component: () => import("pages/GMap.vue"),
        beforeEnter: (to, from, next) => {
          fireAuth.onAuthStateChanged(user => {
            if (user) {
              console.log("user is logged in | route guard");
              next()
            } else {
              console.log("user is logged out | route guard");
            }
          })
        }
      },
      {
        path: "/signup",
        name: 'Signup',
        component: () => import("pages/Signup.vue"),
      },
      {
        path: "/login",
        name: 'Login',
        component: () => import("pages/Login.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
