import { defineStore } from "pinia";

import solicitudService from "../services/solicitud.service";

export const useSolicitudStore = defineStore(
  "solicitud",
  {
    state: () => ({
      solicitudes: [],
      solicitudActual: null,
      historial: [],

      paginacion: {
        total: 0,
        pagina: 1,
        limite: 10,
        totalPaginas: 0,
        tienePaginaAnterior: false,
        tienePaginaSiguiente: false
      },

      cargando: false,
      error: null
    }),

    actions: {
      async obtenerSolicitudes(params = {}) {
        this.cargando = true;
        this.error = null;

        try {
          const response =
            await solicitudService.obtenerSolicitudes(
              params
            );

          this.solicitudes = response.data;
          this.paginacion = response.paginacion;

          return response;
        } catch (error) {
          this.error =
            error.response?.data?.message ||
            "No fue posible obtener las solicitudes";

          throw error;
        } finally {
          this.cargando = false;
        }
      },

      async obtenerSolicitudPorId(id) {
        this.cargando = true;
        this.error = null;

        try {
          const response =
            await solicitudService.obtenerSolicitudPorId(
              id
            );

          this.solicitudActual = response.data;

          return response.data;
        } catch (error) {
          this.error =
            error.response?.data?.message ||
            "No fue posible obtener la solicitud";

          throw error;
        } finally {
          this.cargando = false;
        }
      },

      async crearSolicitud(data) {
        this.cargando = true;
        this.error = null;

        try {
          const response =
            await solicitudService.crearSolicitud(
              data
            );

          return response.data;
        } catch (error) {
          this.error =
            error.response?.data?.message ||
            "No fue posible crear la solicitud";

          throw error;
        } finally {
          this.cargando = false;
        }
      },

      async actualizarSolicitud(id, data) {
        this.cargando = true;
        this.error = null;

        try {
          const response =
            await solicitudService.actualizarSolicitud(
              id,
              data
            );

          this.solicitudActual = response.data;

          return response.data;
        } catch (error) {
          this.error =
            error.response?.data?.message ||
            "No fue posible actualizar la solicitud";

          throw error;
        } finally {
          this.cargando = false;
        }
      },

      async cambiarEstado(id, data) {
        this.cargando = true;
        this.error = null;

        try {
          const response =
            await solicitudService.cambiarEstadoSolicitud(
              id,
              data
            );

          this.solicitudActual = response.data;

          return response.data;
        } catch (error) {
          this.error =
            error.response?.data?.message ||
            "No fue posible cambiar el estado";

          throw error;
        } finally {
          this.cargando = false;
        }
      },

      async eliminarSolicitud(id) {
        this.cargando = true;
        this.error = null;

        try {
          return await solicitudService.eliminarSolicitud(
            id
          );
        } catch (error) {
          this.error =
            error.response?.data?.message ||
            "No fue posible eliminar la solicitud";

          throw error;
        } finally {
          this.cargando = false;
        }
      },

      async obtenerHistorial(id) {
        this.cargando = true;
        this.error = null;

        try {
          const response =
            await solicitudService.obtenerHistorial(
              id
            );

          this.historial = response.data;

          return response.data;
        } catch (error) {
          this.error =
            error.response?.data?.message ||
            "No fue posible obtener el historial";

          throw error;
        } finally {
          this.cargando = false;
        }
      }
    }
  }
);