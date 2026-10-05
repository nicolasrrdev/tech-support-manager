<script setup>
import { onMounted, reactive } from "vue";
import { RouterLink } from "vue-router";

import { useSolicitudStore } from "../stores/solicitud.store";

const solicitudStore = useSolicitudStore();

const filtros = reactive({
  busqueda: "",
  estado: "",
  prioridad: "",
  categoria: "",
  orden: "fechaCreacion",
  direccion: "desc",
  pagina: 1,
  limite: 10
});

const cargarSolicitudes = async () => {
  try {
    await solicitudStore.obtenerSolicitudes(filtros);
  } catch (error) {
    console.error(error);
  }
};

const buscar = () => {
  filtros.pagina = 1;
  cargarSolicitudes();
};

const limpiarFiltros = () => {
  filtros.busqueda = "";
  filtros.estado = "";
  filtros.prioridad = "";
  filtros.categoria = "";
  filtros.orden = "fechaCreacion";
  filtros.direccion = "desc";
  filtros.pagina = 1;

  cargarSolicitudes();
};

const cambiarPagina = (pagina) => {
  if (pagina < 1) {
    return;
  }

  if (
    solicitudStore.paginacion.totalPaginas > 0 &&
    pagina > solicitudStore.paginacion.totalPaginas
  ) {
    return;
  }

  filtros.pagina = pagina;

  cargarSolicitudes();
};

const cambiarOrden = () => {
  filtros.pagina = 1;
  cargarSolicitudes();
};

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
    dateStyle: "short",
    timeStyle: "short"
  });
};

onMounted(() => {
  cargarSolicitudes();
});
</script>

<template>
  <section class="solicitudes-page">
    <div class="page-header">
      <div>
        <h2>Solicitudes de soporte</h2>

        <p>
          Administra y consulta las solicitudes de soporte tecnológico.
        </p>
      </div>

      <RouterLink
        to="/solicitudes/nueva"
        class="btn btn-primary"
      >
        + Nueva solicitud
      </RouterLink>
    </div>

    <div class="filters-card">
      <div class="filters-grid">
        <div class="field field-search">
          <label for="busqueda">
            Buscar
          </label>

          <input
            id="busqueda"
            v-model="filtros.busqueda"
            type="text"
            placeholder="Título, descripción o solicitante..."
            @keyup.enter="buscar"
          />
        </div>

        <div class="field">
          <label for="estado">
            Estado
          </label>

          <select
            id="estado"
            v-model="filtros.estado"
            @change="buscar"
          >
            <option value="">
              Todos
            </option>

            <option value="Pendiente">
              Pendiente
            </option>

            <option value="En progreso">
              En progreso
            </option>

            <option value="Resuelta">
              Resuelta
            </option>

            <option value="Cancelada">
              Cancelada
            </option>
          </select>
        </div>

        <div class="field">
          <label for="prioridad">
            Prioridad
          </label>

          <select
            id="prioridad"
            v-model="filtros.prioridad"
            @change="buscar"
          >
            <option value="">
              Todas
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
        </div>

        <div class="field">
          <label for="categoria">
            Categoría
          </label>

          <select
            id="categoria"
            v-model="filtros.categoria"
            @change="buscar"
          >
            <option value="">
              Todas
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
        </div>

        <div class="field">
          <label for="orden">
            Ordenar por
          </label>

          <select
            id="orden"
            v-model="filtros.orden"
            @change="cambiarOrden"
          >
            <option value="fechaCreacion">
              Fecha de creación
            </option>

            <option value="fechaActualizacion">
              Última actualización
            </option>

            <option value="titulo">
              Título
            </option>

            <option value="prioridad">
              Prioridad
            </option>

            <option value="estado">
              Estado
            </option>

            <option value="categoria">
              Categoría
            </option>
          </select>
        </div>

        <div class="field">
          <label for="direccion">
            Dirección
          </label>

          <select
            id="direccion"
            v-model="filtros.direccion"
            @change="cambiarOrden"
          >
            <option value="desc">
              Descendente
            </option>

            <option value="asc">
              Ascendente
            </option>
          </select>
        </div>
      </div>

      <div class="filter-actions">
        <button
          type="button"
          class="btn btn-primary"
          @click="buscar"
        >
          Buscar
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          @click="limpiarFiltros"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <div
      v-if="solicitudStore.error"
      class="alert alert-error"
    >
      {{ solicitudStore.error }}
    </div>

    <div class="results-header">
      <span>
        <strong>
          {{ solicitudStore.paginacion.total }}
        </strong>
        solicitudes encontradas
      </span>
    </div>

    <div
      v-if="solicitudStore.cargando"
      class="loading"
    >
      Cargando solicitudes...
    </div>

    <div
      v-else-if="solicitudStore.solicitudes.length === 0"
      class="empty-state"
    >
      <h3>No hay solicitudes</h3>

      <p>
        No se encontraron solicitudes con los filtros seleccionados.
      </p>

      <RouterLink
        to="/solicitudes/nueva"
        class="btn btn-primary"
      >
        Crear primera solicitud
      </RouterLink>
    </div>

    <div
      v-else
      class="table-container"
    >
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Solicitante</th>
            <th>Categoría</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="solicitud in solicitudStore.solicitudes"
            :key="solicitud._id"
          >
            <td>
              <strong>
                {{ solicitud.titulo }}
              </strong>

              <small>
                {{ solicitud.descripcion }}
              </small>
            </td>

            <td>
              {{ solicitud.usuarioSolicitante }}
            </td>

            <td>
              {{ solicitud.categoria }}
            </td>

            <td>
              <span
                class="badge"
                :class="obtenerClasePrioridad(solicitud.prioridad)"
              >
                {{ solicitud.prioridad }}
              </span>
            </td>

            <td>
              <span
                class="badge"
                :class="obtenerClaseEstado(solicitud.estado)"
              >
                {{ solicitud.estado }}
              </span>
            </td>

            <td>
              {{ formatearFecha(solicitud.fechaCreacion) }}
            </td>

            <td>
              <RouterLink
                :to="`/solicitudes/${solicitud._id}`"
                class="btn btn-small"
              >
                Ver detalle
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="
        !solicitudStore.cargando &&
        solicitudStore.paginacion.totalPaginas > 0
      "
      class="pagination"
    >
      <button
        type="button"
        class="pagination-button"
        :disabled="
          !solicitudStore.paginacion.tienePaginaAnterior
        "
        @click="
          cambiarPagina(
            solicitudStore.paginacion.pagina - 1
          )
        "
      >
        Anterior
      </button>

      <span>
        Página
        <strong>
          {{ solicitudStore.paginacion.pagina }}
        </strong>
        de
        <strong>
          {{ solicitudStore.paginacion.totalPaginas }}
        </strong>
      </span>

      <button
        type="button"
        class="pagination-button"
        :disabled="
          !solicitudStore.paginacion.tienePaginaSiguiente
        "
        @click="
          cambiarPagina(
            solicitudStore.paginacion.pagina + 1
          )
        "
      >
        Siguiente
      </button>
    </div>
  </section>
</template>

<style scoped>
.solicitudes-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.page-header h2 {
  margin: 0 0 8px;
  font-size: 28px;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.filters-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr repeat(5, 1fr);
  gap: 15px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.field input,
.field select {
  width: 100%;
  box-sizing: border-box;
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  background: white;
  font-size: 14px;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
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
  font-weight: 600;
  box-sizing: border-box;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-small {
  min-height: 34px;
  padding: 6px 10px;
  background: #eff6ff;
  color: #1d4ed8;
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

.results-header {
  margin-bottom: 12px;
  color: #6b7280;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

thead {
  background: #f9fafb;
}

th,
td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

th {
  color: #374151;
  font-weight: 700;
}

td {
  color: #4b5563;
}

td strong {
  display: block;
  color: #111827;
  margin-bottom: 4px;
}

td small {
  display: block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #9ca3af;
}

tbody tr:hover {
  background: #f9fafb;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
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

.loading,
.empty-state {
  padding: 50px 20px;
  text-align: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.loading {
  color: #6b7280;
}

.empty-state h3 {
  margin-top: 0;
  color: #111827;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.pagination-button {
  padding: 9px 15px;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  background: white;
  cursor: pointer;
}

.pagination-button:hover:not(:disabled) {
  background: #f3f4f6;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1100px) {
  .filters-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .field-search {
    grid-column: span 3;
  }
}

@media (max-width: 700px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .field-search {
    grid-column: span 1;
  }

  .filter-actions {
    flex-direction: column;
  }

  .filter-actions .btn {
    width: 100%;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>