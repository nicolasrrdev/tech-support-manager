const CATEGORIAS = Object.freeze([
  "Hardware",
  "Software",
  "Red",
  "Accesos",
  "Otros"
]);

const PRIORIDADES = Object.freeze([
  "Baja",
  "Media",
  "Alta",
  "Crítica"
]);

const ESTADOS = Object.freeze([
  "Pendiente",
  "En progreso",
  "Resuelta",
  "Cancelada"
]);

const TRANSICIONES_ESTADO = Object.freeze({
  "Pendiente": [
    "En progreso",
    "Cancelada"
  ],
  "En progreso": [
    "Resuelta",
    "Cancelada"
  ],
  "Resuelta": [],
  "Cancelada": []
});

module.exports = {
  CATEGORIAS,
  PRIORIDADES,
  ESTADOS,
  TRANSICIONES_ESTADO
};