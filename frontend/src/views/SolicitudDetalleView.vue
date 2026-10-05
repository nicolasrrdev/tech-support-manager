<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {
  RouterLink,
  useRoute,
  useRouter
} from "vue-router";

import { useSolicitudStore } from "../stores/solicitud.store";

const route = useRoute();
const router = useRouter();

const solicitudStore = useSolicitudStore();

const mostrarModalEstado = ref(false);
const mostrarModalEliminar = ref(false);

const nuevoEstado = ref("");

const formularioEstado = reactive({
  usuarioResponsable: "",
  observacion: ""
});

const erroresEstado = reactive({
  usuarioResponsable: "",
  observacion: ""
});

const solicitud = computed(
  () => solicitudStore.solicitudActual
);

const estadosDisponibles = computed(() => {
  if (!solicitud.value) {
    return [];
  }

  const transiciones = {
    Pendiente: [
      "En progreso",
      "Cancelada"
    ],
    "En progreso": [
      "Resuelta",
      "Cancelada"
    ],
    Resuelta: [],
    Cancelada: []
  };

  return transiciones[solicitud.value.estado] || [];
});

const puedeEditar = computed(() => {
  if (!solicitud.value) {
    return false;
  }

  return (
    solicitud.value.estado === "Pendiente" ||
    solicitud.value.estado === "En progreso"
  );
});

const puedeEliminar = computed(() => {
  if (!solicitud.value) {
    return false;
  }

  return (
    solicitud.value.estado === "Pendiente" ||
    solicitud.value.estado === "Cancelada"
  );
});

const requiereObservacion = computed(() => {
  if (!solicitud.value) {
    return false;
  }

  return (
    nuevoEstado.value === "Cancelada" ||
    (
      nuevoEstado.value === "Resuelta" &&
      solicitud.value.prioridad === "Crítica"
    )
  );
});

const obtenerClaseEstado = (estado) => {
  const clases = {
    Pendiente: "estado-pendiente",
    "En progreso": "estado-progreso",
    Resuelta: "estado-resuelta",
    Cancelada: "estado-cancelada"
  };

  return clases[estado] || "";
};

const obtenerClasePrioridad = (prioridad) => {
  const clases = {
    Baja: "prioridad-baja",
    Media: "prioridad-media",
    Alta: "prioridad-alta",
    "Crítica": "prioridad-critica"
  };

  return clases[prioridad] || "";
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "-";
  }

  return new Date(fecha).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

const limpiarErroresEstado = () => {
  erroresEstado.usuarioResponsable = "";
  erroresEstado.observacion = "";
  solicitudStore.error = null;
};

const abrirModalEstado = (estado) => {
  nuevoEstado.value = estado;

  formularioEstado.usuarioResponsable = "";
  formularioEstado.observacion = "";

  limpiarErroresEstado();

  mostrarModalEstado.value = true;
};

const cerrarModalEstado = () => {
  if (solicitudStore.cargando) {
    return;
  }

  mostrarModalEstado.value = false;
};

const validarCambioEstado = () => {
  limpiarErroresEstado();

  let valido = true;

  if (!formularioEstado.usuarioResponsable.trim()) {
    erroresEstado.usuarioResponsable =
      "El usuario responsable es obligatorio";

    valido = false;
  } else if (
    formularioEstado.usuarioResponsable.trim().length < 2
  ) {
    erroresEstado.usuarioResponsable =
      "Debe tener mínimo 2 caracteres";

    valido = false;
  }

  if (requiereObservacion.value) {
    if (!formularioEstado.observacion.trim()) {
      erroresEstado.observacion =
        "La observación es obligatoria para este cambio de estado";

      valido = false;
    }
  }

  if (
    formularioEstado.observacion.length > 500
  ) {
    erroresEstado.observacion =
      "La observación no puede superar los 500 caracteres";

    valido = false;
  }

  return valido;
};

const confirmarCambioEstado = async () => {
  if (!validarCambioEstado()) {
    return;
  }

  try {
    await solicitudStore.cambiarEstado(
      route.params.id,
      {
        estado: nuevoEstado.value,
        usuarioResponsable:
          formularioEstado.usuarioResponsable.trim(),
        observacion:
          formularioEstado.observacion.trim() || undefined
      }
    );

    mostrarModalEstado.value = false;

    await solicitudStore.obtenerHistorial(
      route.params.id
    );
  } catch (error) {
    const erroresBackend =
      error.response?.data?.errors;

    if (erroresBackend?.usuarioResponsable) {
      erroresEstado.usuarioResponsable =
        erroresBackend.usuarioResponsable;
    }

    if (erroresBackend?.observacion) {
      erroresEstado.observacion =
        erroresBackend.observacion;
    }

    console.error(error);
  }
};

const abrirModalEliminar = () => {
  mostrarModalEliminar.value = true;
};

const cerrarModalEliminar = () => {
  if (solicitudStore.cargando) {
    return;
  }

  mostrarModalEliminar.value = false;
};

const confirmarEliminacion = async () => {
  try {
    await solicitudStore.eliminarSolicitud(
      route.params.id
    );

    await router.push("/solicitudes");
  } catch (error) {
    console.error(error);
  }
};

const cargarSolicitud = async () => {
  try {
    await Promise.all([
      solicitudStore.obtenerSolicitudPorId(
        route.params.id
      ),
      solicitudStore.obtenerHistorial(
        route.params.id
      )
    ]);
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  cargarSolicitud();
});
</script>

<template>
  <section class="detail-page">
    <div
      v-if="solicitudStore.cargando && !solicitud"
      class="loading"
    >
      Cargando solicitud...
    </div>

    <template v-else-if="solicitud">
      <div class="page-header">
        <div>
          <RouterLink
            to="/solicitudes"
            class="back-link"
          >
            ← Volver a solicitudes
          </RouterLink>

          <h2>
            {{ solicitud.titulo }}
          </h2>

          <p>
            Detalle de la solicitud de soporte
          </p>
        </div>

        <div class="header-actions">
          <RouterLink
            v-if="puedeEditar"
            :to="`/solicitudes/${solicitud._id}/editar`"
            class="btn btn-secondary"
          >
            Editar
          </RouterLink>

          <button
            v-if="puedeEliminar"
            type="button"
            class="btn btn-danger-outline"
            @click="abrirModalEliminar"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div
        v-if="solicitudStore.error"
        class="alert alert-error"
      >
        {{ solicitudStore.error }}
      </div>

      <div class="status-summary">
        <div class="summary-item">
          <span class="summary-label">
            Estado
          </span>

          <span
            class="badge"
            :class="
              obtenerClaseEstado(
                solicitud.estado
              )
            "
          >
            {{ solicitud.estado }}
          </span>
        </div>

        <div class="summary-item">
          <span class="summary-label">
            Prioridad
          </span>

          <span
            class="badge"
            :class="
              obtenerClasePrioridad(
                solicitud.prioridad
              )
            "
          >
            {{ solicitud.prioridad }}
          </span>
        </div>

        <div class="summary-item">
          <span class="summary-label">
            Categoría
          </span>

          <strong>
            {{ solicitud.categoria }}
          </strong>
        </div>

        <div class="summary-item">
          <span class="summary-label">
            Solicitante
          </span>

          <strong>
            {{ solicitud.usuarioSolicitante }}
          </strong>
        </div>
      </div>

      <div class="content-grid">
        <div class="main-column">
          <article class="card">
            <div class="card-header">
              <h3>
                Descripción
              </h3>
            </div>

            <div class="description">
              {{ solicitud.descripcion }}
            </div>
          </article>

          <article class="card">
            <div class="card-header">
              <div>
                <h3>
                  Historial
                </h3>

                <p>
                  Registro de cambios de estado
                </p>
              </div>
            </div>

            <div
              v-if="
                solicitudStore.historial.length === 0
              "
              class="empty-history"
            >
              No hay registros de historial.
            </div>

            <div
              v-else
              class="timeline"
            >
              <div
                v-for="registro in solicitudStore.historial"
                :key="registro._id"
                class="timeline-item"
              >
                <div class="timeline-marker"></div>

                <div class="timeline-content">
                  <div class="timeline-header">
                    <strong>
                      {{ registro.estadoNuevo }}
                    </strong>

                    <span>
                      {{
                        formatearFecha(
                          registro.fechaHora
                        )
                      }}
                    </span>
                  </div>

                  <div
                    v-if="registro.estadoAnterior"
                    class="transition"
                  >
                    {{ registro.estadoAnterior }}
                    →
                    {{ registro.estadoNuevo }}
                  </div>

                  <p
                    v-if="registro.observacion"
                    class="observation"
                  >
                    "{{ registro.observacion }}"
                  </p>

                  <small>
                    Responsable:
                    {{ registro.usuarioResponsable }}
                  </small>
                </div>
              </div>
            </div>
          </article>
        </div>

        <aside class="side-column">
          <article class="card">
            <div class="card-header">
              <h3>
                Información
              </h3>
            </div>

            <div class="info-list">
              <div class="info-item">
                <span>
                  Fecha de creación
                </span>

                <strong>
                  {{
                    formatearFecha(
                      solicitud.fechaCreacion
                    )
                  }}
                </strong>
              </div>

              <div class="info-item">
                <span>
                  Última actualización
                </span>

                <strong>
                  {{
                    formatearFecha(
                      solicitud.fechaActualizacion
                    )
                  }}
                </strong>
              </div>

              <div class="info-item">
                <span>
                  Identificador
                </span>

                <strong class="id-value">
                  {{ solicitud._id }}
                </strong>
              </div>
            </div>
          </article>

          <article
            v-if="estadosDisponibles.length > 0"
            class="card"
          >
            <div class="card-header">
              <div>
                <h3>
                  Cambiar estado
                </h3>

                <p>
                  Selecciona una transición válida
                </p>
              </div>
            </div>

            <div class="state-actions">
              <button
                v-for="estado in estadosDisponibles"
                :key="estado"
                type="button"
                class="state-button"
                @click="abrirModalEstado(estado)"
              >
                {{ estado }}
              </button>
            </div>
          </article>

          <article
            v-else
            class="card final-state"
          >
            <strong>
              Solicitud finalizada
            </strong>

            <p>
              Esta solicitud no tiene más transiciones
              de estado disponibles.
            </p>
          </article>
        </aside>
      </div>
    </template>

    <div
      v-else
      class="empty-state"
    >
      <h3>
        Solicitud no encontrada
      </h3>

      <p>
        No fue posible encontrar la solicitud solicitada.
      </p>

      <RouterLink
        to="/solicitudes"
        class="btn btn-primary"
      >
        Volver a solicitudes
      </RouterLink>
    </div>

    <!-- Modal cambio de estado -->
    <div
      v-if="mostrarModalEstado"
      class="modal-overlay"
      @click.self="cerrarModalEstado"
    >
      <div class="modal">
        <div class="modal-header">
          <div>
            <h3>
              Cambiar estado
            </h3>

            <p>
              {{ solicitud.estado }}
              →
              {{ nuevoEstado }}
            </p>
          </div>

          <button
            type="button"
            class="modal-close"
            @click="cerrarModalEstado"
          >
            ×
          </button>
        </div>

        <div class="modal-body">
          <div class="field">
            <label for="usuarioResponsable">
              Usuario responsable
              <span>*</span>
            </label>

            <input
              id="usuarioResponsable"
              v-model="
                formularioEstado.usuarioResponsable
              "
              type="text"
              maxlength="100"
              placeholder="Nombre del responsable"
              :class="{
                invalid:
                  erroresEstado.usuarioResponsable
              }"
            />

            <small
              v-if="
                erroresEstado.usuarioResponsable
              "
              class="field-error"
            >
              {{
                erroresEstado.usuarioResponsable
              }}
            </small>
          </div>

          <div class="field">
            <label for="observacion">
              Observación
              <span v-if="requiereObservacion">
                *
              </span>
            </label>

            <textarea
              id="observacion"
              v-model="
                formularioEstado.observacion
              "
              rows="5"
              maxlength="500"
              placeholder="Escribe una observación..."
              :class="{
                invalid:
                  erroresEstado.observacion
              }"
            ></textarea>

            <div class="field-footer">
              <small
                v-if="erroresEstado.observacion"
                class="field-error"
              >
                {{ erroresEstado.observacion }}
              </small>

              <small class="counter">
                {{
                  formularioEstado.observacion.length
                }}/500
              </small>
            </div>
          </div>

          <div
            v-if="requiereObservacion"
            class="observation-info"
          >
            La observación es obligatoria para esta
            transición.
          </div>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="solicitudStore.cargando"
            @click="cerrarModalEstado"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="btn btn-primary"
            :disabled="solicitudStore.cargando"
            @click="confirmarCambioEstado"
          >
            {{
              solicitudStore.cargando
                ? "Guardando..."
                : "Confirmar cambio"
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal eliminación -->
    <div
      v-if="mostrarModalEliminar"
      class="modal-overlay"
      @click.self="cerrarModalEliminar"
    >
      <div class="modal modal-small">
        <div class="modal-header">
          <div>
            <h3>
              Eliminar solicitud
            </h3>
          </div>

          <button
            type="button"
            class="modal-close"
            @click="cerrarModalEliminar"
          >
            ×
          </button>
        </div>

        <div class="modal-body">
          <p>
            ¿Estás seguro de que deseas eliminar esta
            solicitud?
          </p>

          <p class="warning-text">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="solicitudStore.cargando"
            @click="cerrarModalEliminar"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="btn btn-danger"
            :disabled="solicitudStore.cargando"
            @click="confirmarEliminacion"
          >
            {{
              solicitudStore.cargando
                ? "Eliminando..."
                : "Eliminar"
            }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 25px;
}

.back-link {
  display: inline-block;
  margin-bottom: 12px;

  color: #2563eb;
  text-decoration: none;

  font-size: 14px;
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}

.page-header h2 {
  margin: 0 0 8px;

  color: #111827;
  font-size: 28px;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.status-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;

  margin-bottom: 20px;

  overflow: hidden;

  border: 1px solid #e5e7eb;
  border-radius: 12px;

  background: #e5e7eb;
}

.summary-item {
  min-height: 90px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  gap: 8px;

  padding: 18px;

  background: white;
}

.summary-label {
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 20px;
}

.main-column,
.side-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;

  border: 1px solid #e5e7eb;
  border-radius: 12px;

  overflow: hidden;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 18px 20px;

  border-bottom: 1px solid #e5e7eb;
}

.card-header h3 {
  margin: 0;

  color: #111827;
  font-size: 17px;
}

.card-header p {
  margin: 5px 0 0;

  color: #6b7280;
  font-size: 13px;
}

.description {
  padding: 20px;

  color: #374151;

  line-height: 1.7;

  white-space: pre-wrap;
}

.info-list {
  padding: 8px 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;

  padding: 14px 0;

  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item span {
  color: #6b7280;
  font-size: 12px;
}

.info-item strong {
  color: #111827;
  font-size: 14px;
}

.id-value {
  word-break: break-all;
  font-family: monospace;
  font-size: 11px !important;
}

.state-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 20px;
}

.state-button {
  min-height: 42px;

  padding: 9px 14px;

  border: 1px solid #d1d5db;
  border-radius: 7px;

  background: white;

  color: #374151;

  cursor: pointer;

  font-weight: 600;
  text-align: left;
}

.state-button:hover {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}

.final-state {
  padding: 20px;
}

.final-state strong {
  color: #374151;
}

.final-state p {
  margin-bottom: 0;

  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
}

.timeline {
  padding: 20px;
}

.timeline-item {
  position: relative;

  display: flex;

  gap: 15px;

  padding-bottom: 25px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item:not(:last-child)::before {
  content: "";

  position: absolute;

  top: 10px;
  left: 5px;
  bottom: 0;

  width: 2px;

  background: #e5e7eb;
}

.timeline-marker {
  position: relative;
  z-index: 1;

  flex: 0 0 12px;

  width: 12px;
  height: 12px;

  margin-top: 4px;

  border-radius: 50%;

  background: #2563eb;

  box-shadow:
    0 0 0 4px #dbeafe;
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.timeline-header strong {
  color: #111827;
}

.timeline-header span {
  color: #9ca3af;
  font-size: 12px;
}

.transition {
  margin-top: 5px;

  color: #6b7280;
  font-size: 13px;
}

.observation {
  margin: 10px 0;

  padding: 10px 12px;

  border-left: 3px solid #d1d5db;

  background: #f9fafb;

  color: #4b5563;

  font-size: 13px;
  line-height: 1.5;
}

.timeline-content small {
  color: #9ca3af;
  font-size: 12px;
}

.badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;

  padding: 5px 9px;

  border-radius: 999px;

  font-size: 12px;
  font-weight: 700;
}

.estado-pendiente {
  background: #fef3c7;
  color: #92400e;
}

.estado-progreso {
  background: #dbeafe;
  color: #1e40af;
}

.estado-resuelta {
  background: #dcfce7;
  color: #166534;
}

.estado-cancelada {
  background: #fee2e2;
  color: #991b1b;
}

.prioridad-baja {
  background: #f3f4f6;
  color: #374151;
}

.prioridad-media {
  background: #fef3c7;
  color: #92400e;
}

.prioridad-alta {
  background: #ffedd5;
  color: #9a3412;
}

.prioridad-critica {
  background: #fee2e2;
  color: #991b1b;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 40px;

  padding: 8px 15px;

  border: none;
  border-radius: 7px;

  text-decoration: none;

  cursor: pointer;

  font-size: 14px;
  font-weight: 700;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-danger-outline {
  background: white;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.btn-danger-outline:hover {
  background: #fef2f2;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 14px 16px;

  border-radius: 8px;

  margin-bottom: 20px;
}

.alert-error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.loading,
.empty-state {
  padding: 50px 20px;

  text-align: center;

  background: white;

  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.empty-state h3 {
  margin-top: 0;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 20px;
}

.empty-history {
  padding: 30px 20px;

  text-align: center;

  color: #9ca3af;
}

/* Modal */

.modal-overlay {
  position: fixed;
  z-index: 1000;

  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(17, 24, 39, 0.55);
}

.modal {
  width: min(100%, 550px);

  max-height: 90vh;

  overflow-y: auto;

  background: white;

  border-radius: 12px;

  box-shadow:
    0 20px 40px
    rgba(0, 0, 0, 0.2);
}

.modal-small {
  width: min(100%, 450px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  padding: 20px;

  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;

  color: #111827;
}

.modal-header p {
  margin: 5px 0 0;

  color: #6b7280;
  font-size: 13px;
}

.modal-close {
  border: none;

  background: transparent;

  color: #6b7280;

  font-size: 26px;
  line-height: 1;

  cursor: pointer;
}

.modal-close:hover {
  color: #111827;
}

.modal-body {
  padding: 20px;
}

.modal-body > p:first-child {
  margin-top: 0;

  color: #374151;
}

.warning-text {
  color: #b91c1c !important;

  font-size: 13px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;

  margin-bottom: 20px;
}

.field:last-child {
  margin-bottom: 0;
}

.field label {
  color: #374151;

  font-size: 14px;
  font-weight: 700;
}

.field label span {
  color: #dc2626;
}

.field input,
.field textarea {
  width: 100%;

  box-sizing: border-box;

  padding: 10px 12px;

  border: 1px solid #d1d5db;
  border-radius: 7px;

  font-size: 14px;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field textarea:focus {
  outline: none;

  border-color: #2563eb;

  box-shadow:
    0 0 0 2px
    rgba(37, 99, 235, 0.1);
}

.field input.invalid,
.field textarea.invalid {
  border-color: #dc2626;
}

.field-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.field-error {
  color: #dc2626;
  font-size: 12px;
}

.counter {
  margin-left: auto;

  color: #9ca3af;
  font-size: 12px;
}

.observation-info {
  padding: 12px;

  border-radius: 7px;

  background: #eff6ff;
  color: #1e40af;

  font-size: 13px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  padding: 16px 20px;

  border-top: 1px solid #e5e7eb;
}

@media (max-width: 800px) {
  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
  }

  .status-summary {
    grid-template-columns: 1fr 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 550px) {
  .status-summary {
    grid-template-columns: 1fr;
  }

  .timeline-header {
    flex-direction: column;
    gap: 5px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions .btn {
    width: 100%;
  }
}
</style>