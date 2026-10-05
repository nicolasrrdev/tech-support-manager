import {
  createRouter,
  createWebHistory
} from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/solicitudes"
  },

  {
    path: "/solicitudes",
    name: "solicitudes",
    component: () =>
      import("../views/SolicitudesView.vue")
  },

  {
    path: "/solicitudes/nueva",
    name: "solicitud-nueva",
    component: () =>
      import("../views/SolicitudFormView.vue")
  },

  {
    path: "/solicitudes/:id",
    name: "solicitud-detalle",
    component: () =>
      import("../views/SolicitudDetalleView.vue")
  },

  {
    path: "/solicitudes/:id/editar",
    name: "solicitud-editar",
    component: () =>
      import("../views/SolicitudFormView.vue")
  },

  {
    path: "/:pathMatch(.*)*",
    redirect: "/solicitudes"
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;