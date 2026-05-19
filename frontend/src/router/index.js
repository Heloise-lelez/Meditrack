import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/steps",
    name: "steps",

    component: () => import("@/views/StepsView.vue"),
  },
  {
    path: "/appointments",
    name: "appointments",
    component: () => import("@/views/AppointmentsView.vue"),
  },
  {
    path: "/documents",
    name: "documents",
    component: () => import("@/views/DocumentsView.vue"),
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/ProfileView.vue"),
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
