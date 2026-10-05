import api from "./api";

const obtenerSolicitudes = async (params = {}) => {
  const response = await api.get("/solicitudes", {
    params
  });

  return response.data;
};

const obtenerSolicitudPorId = async (id) => {
  const response = await api.get(
    `/solicitudes/${id}`
  );

  return response.data;
};

const crearSolicitud = async (data) => {
  const response = await api.post(
    "/solicitudes",
    data
  );

  return response.data;
};

const actualizarSolicitud = async (id, data) => {
  const response = await api.put(
    `/solicitudes/${id}`,
    data
  );

  return response.data;
};

const cambiarEstadoSolicitud = async (
  id,
  data
) => {
  const response = await api.patch(
    `/solicitudes/${id}/estado`,
    data
  );

  return response.data;
};

const eliminarSolicitud = async (id) => {
  const response = await api.delete(
    `/solicitudes/${id}`
  );

  return response.data;
};

const obtenerHistorial = async (id) => {
  const response = await api.get(
    `/solicitudes/${id}/historial`
  );

  return response.data;
};

export default {
  obtenerSolicitudes,
  obtenerSolicitudPorId,
  crearSolicitud,
  actualizarSolicitud,
  cambiarEstadoSolicitud,
  eliminarSolicitud,
  obtenerHistorial
};