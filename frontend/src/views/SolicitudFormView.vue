<script setup>
import { computed, onMounted, reactive } from "vue";
import {
  RouterLink,
  useRoute,
  useRouter
} from "vue-router";

import { useSolicitudStore } from "../stores/solicitud.store";

const route = useRoute();
const router = useRouter();
const solicitudStore = useSolicitudStore();

const esEdicion = computed(() => Boolean(route.params.id));

const formulario = reactive({
  titulo: "",
  descripcion: "",
  usuarioSolicitante: "",
  categoria: "",
  prioridad: ""
});

const errores = reactive({
  titulo: "",
  descripcion: "",
  usuarioSolicitante: "",
  categoria: "",
  prioridad: ""
});

const limpiarErrores = () => {
  Object.keys(errores).forEach((campo) => {
    errores[campo] = "";
  });

  solicitudStore.error = null;
};

const limpiarFormulario = () => {
  formulario.titulo = "";
  formulario.descripcion = "";
  formulario.usuarioSolicitante = "";
  formulario.categoria = "";
  formulario.prioridad = "";
};

const cargarSolicitudParaEditar = async () => {
  if (!esEdicion.value) {
    return;
  }

  try {
    const solicitud =
      await solicitudStore.obtenerSolicitudPorId(
        route.params.id
      );

    formulario.titulo = solicitud.titulo;
    formulario.descripcion = solicitud.descripcion;
    formulario.usuarioSolicitante =
      solicitud.usuarioSolicitante;
    formulario.categoria = solicitud.categoria;
    formulario.prioridad = solicitud.prioridad;
  } catch (error) {
    console.error(error);
  }
};

const validarFormulario = () => {
  limpiarErrores();

  let valido = true;

  if (!formulario.titulo.trim()) {
    errores.titulo = "El título es obligatorio";
    valido = false;
  } else if (formulario.titulo.trim().length < 5) {
    errores.titulo =
      "El título debe tener mínimo 5 caracteres";
    valido = false;
  } else if (formulario.titulo.trim().length > 150) {
    errores.titulo =
      "El título no puede superar los 150 caracteres";
    valido = false;
  }

  if (!formulario.descripcion.trim()) {
    errores.descripcion =
      "La descripción es obligatoria";
    valido = false;
  } else if (formulario.descripcion.trim().length < 10) {
    errores.descripcion =
      "La descripción debe tener mínimo 10 caracteres";
    valido = false;
  } else if (formulario.descripcion.trim().length > 2000) {
    errores.descripcion =
      "La descripción no puede superar los 2000 caracteres";
    valido = false;
  }

  if (!formulario.usuarioSolicitante.trim()) {
    errores.usuarioSolicitante =
      "El usuario solicitante es obligatorio";
    valido = false;
  } else if (
    formulario.usuarioSolicitante.trim().length < 2
  ) {
    errores.usuarioSolicitante =
      "El usuario solicitante debe tener mínimo 2 caracteres";
    valido = false;
  } else if (
    formulario.usuarioSolicitante.trim().length > 100
  ) {
    errores.usuarioSolicitante =
      "El usuario solicitante no puede superar los 100 caracteres";
    valido = false;
  }

  if (!formulario.categoria) {
    errores.categoria =
      "La categoría es obligatoria";
    valido = false;
  }

  if (!formulario.prioridad) {
    errores.prioridad =
      "La prioridad es obligatoria";
    valido = false;
  }

  return valido;
};

const aplicarErroresBackend = (error) => {
  const erroresBackend =
    error.response?.data?.errors;

  if (!erroresBackend) {
    return;
  }

  Object.keys(erroresBackend).forEach((campo) => {
    if (campo in errores) {
      errores[campo] = erroresBackend[campo];
    }
  });
};

const guardarSolicitud = async () => {
  if (!validarFormulario()) {
    return;
  }

  try {
    const data = {
      titulo: formulario.titulo.trim(),
      descripcion: formulario.descripcion.trim(),
      usuarioSolicitante:
        formulario.usuarioSolicitante.trim(),
      categoria: formulario.categoria,
      prioridad: formulario.prioridad
    };

    if (esEdicion.value) {
      await solicitudStore.actualizarSolicitud(
        route.params.id,
        data
      );

      await router.push(
        `/solicitudes/${route.params.id}`
      );

      return;
    }

    const solicitud =
      await solicitudStore.crearSolicitud(data);

    await router.push(
      `/solicitudes/${solicitud._id}`
    );
  } catch (error) {
    aplicarErroresBackend(error);

    console.error(error);
  }
};

onMounted(async () => {
  limpiarErrores();
  limpiarFormulario();

  await cargarSolicitudParaEditar();
});
</script>

<template>
  <section class="form-page">
    <div class="page-header">
      <div>
        <RouterLink
          to="/solicitudes"
          class="back-link"
        >
          ← Volver a solicitudes
        </RouterLink>

        <h2>
          {{
            esEdicion
              ? "Editar solicitud"
              : "Nueva solicitud"
          }}
        </h2>

        <p>
          {{
            esEdicion
              ? "Actualiza la información de la solicitud."
              : "Registra una nueva solicitud de soporte tecnológico."
          }}
        </p>
      </div>
    </div>

    <div
      v-if="solicitudStore.cargando && esEdicion"
      class="loading"
    >
      Cargando información de la solicitud...
    </div>

    <template
      v-else
    >
      <div
        v-if="solicitudStore.error"
        class="alert alert-error"
      >
        {{ solicitudStore.error }}
      </div>

      <form
        class="form-card"
        @submit.prevent="guardarSolicitud"
      >
        <div class="form-grid">
          <div class="field field-full">
            <label for="titulo">
              Título
              <span>*</span>
            </label>

            <input
              id="titulo"
              v-model="formulario.titulo"
              type="text"
              maxlength="150"
              placeholder="Ej. Equipo no enciende"
              :class="{
                invalid: errores.titulo
              }"
            />

            <div class="field-footer">
              <small
                v-if="errores.titulo"
                class="field-error"
              >
                {{ errores.titulo }}
              </small>

              <small class="counter">
                {{ formulario.titulo.length }}/150
              </small>
            </div>
          </div>

          <div class="field field-full">
            <label for="descripcion">
              Descripción
              <span>*</span>
            </label>

            <textarea
              id="descripcion"
              v-model="formulario.descripcion"
              rows="6"
              maxlength="2000"
              placeholder="Describe detalladamente el problema o requerimiento..."
              :class="{
                invalid: errores.descripcion
              }"
            ></textarea>

            <div class="field-footer">
              <small
                v-if="errores.descripcion"
                class="field-error"
              >
                {{ errores.descripcion }}
              </small>

              <small class="counter">
                {{ formulario.descripcion.length }}/2000
              </small>
            </div>
          </div>

          <div class="field">
            <label for="usuarioSolicitante">
              Usuario solicitante
              <span>*</span>
            </label>

            <input
              id="usuarioSolicitante"
              v-model="
                formulario.usuarioSolicitante
              "
              type="text"
              maxlength="100"
              placeholder="Nombre del solicitante"
              :class="{
                invalid:
                  errores.usuarioSolicitante
              }"
            />

            <small
              v-if="errores.usuarioSolicitante"
              class="field-error"
            >
              {{ errores.usuarioSolicitante }}
            </small>
          </div>

          <div class="field">
            <label for="categoria">
              Categoría
              <span>*</span>
            </label>

            <select
              id="categoria"
              v-model="formulario.categoria"
              :class="{
                invalid: errores.categoria
              }"
            >
              <option value="">
                Selecciona una categoría
              </option>

              <option value="Hardware">
                Hardware
              </option>

              <option value="Software">
                Software
              </option>

              <option value="Red">
                Red
              </option>

              <option value="Accesos">
                Accesos
              </option>

              <option value="Otros">
                Otros
              </option>
            </select>

            <small
              v-if="errores.categoria"
              class="field-error"
            >
              {{ errores.categoria }}
            </small>
          </div>

          <div class="field">
            <label for="prioridad">
              Prioridad
              <span>*</span>
            </label>

            <select
              id="prioridad"
              v-model="formulario.prioridad"
              :class="{
                invalid: errores.prioridad
              }"
            >
              <option value="">
                Selecciona una prioridad
              </option>

              <option value="Baja">
                Baja
              </option>

              <option value="Media">
                Media
              </option>

              <option value="Alta">
                Alta
              </option>

              <option value="Crítica">
                Crítica
              </option>
            </select>

            <small
              v-if="errores.prioridad"
              class="field-error"
            >
              {{ errores.prioridad }}
            </small>
          </div>
        </div>

        <div class="form-info">
          <strong>
            Información:
          </strong>

          <span v-if="!esEdicion">
            La solicitud será creada inicialmente con
            estado
            <strong>Pendiente</strong>.
          </span>

          <span v-else>
            El estado actual no se modifica desde este
            formulario.
          </span>
        </div>

        <div class="form-actions">
          <RouterLink
            :to="
              esEdicion
                ? `/solicitudes/${route.params.id}`
                : '/solicitudes'
            "
            class="btn btn-secondary"
          >
            Cancelar
          </RouterLink>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="solicitudStore.cargando"
          >
            {{
              solicitudStore.cargando
                ? "Guardando..."
                : esEdicion
                  ? "Guardar cambios"
                  : "Crear solicitud"
            }}
          </button>
        </div>
      </form>
    </template>
  </section>
</template>

<style scoped>
.form-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
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
  font-size: 28px;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.form-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-full {
  grid-column: span 2;
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
.field select,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  background: white;
  font-size: 14px;
  color: #111827;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.field input,
.field select {
  min-height: 44px;
}

.field textarea {
  resize: vertical;
  min-height: 130px;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow:
    0 0 0 2px
    rgba(37, 99, 235, 0.1);
}

.field input.invalid,
.field select.invalid,
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

.loading {
  padding: 50px 20px;
  text-align: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  color: #6b7280;
}

.form-info {
  display: flex;
  gap: 5px;
  margin-top: 25px;
  padding: 14px 16px;
  border-radius: 8px;
  background: #eff6ff;
  color: #1e40af;
  font-size: 13px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 9px 18px;
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

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 700px) {
  .form-card {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-full {
    grid-column: span 1;
  }

  .form-info {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>