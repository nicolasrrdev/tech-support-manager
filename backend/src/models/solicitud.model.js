const mongoose = require("mongoose");

const {
  CATEGORIAS,
  PRIORIDADES,
  ESTADOS
} = require("./solicitud.constants");

const historialSchema = new mongoose.Schema(
  {
    estadoAnterior: {
      type: String,
      enum: [...ESTADOS, null],
      default: null
    },

    estadoNuevo: {
      type: String,
      enum: ESTADOS,
      required: true
    },

    fechaHora: {
      type: Date,
      default: Date.now,
      required: true
    },

    usuarioResponsable: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    observacion: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  {
    _id: true
  }
);

const solicitudSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      minlength: [5, "El título debe tener mínimo 5 caracteres"],
      maxlength: [150, "El título no puede superar los 150 caracteres"]
    },

    descripcion: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
      minlength: [10, "La descripción debe tener mínimo 10 caracteres"],
      maxlength: [2000, "La descripción no puede superar los 2000 caracteres"]
    },

    usuarioSolicitante: {
      type: String,
      required: [true, "El usuario solicitante es obligatorio"],
      trim: true,
      minlength: [2, "El usuario solicitante debe tener mínimo 2 caracteres"],
      maxlength: [100, "El usuario solicitante no puede superar los 100 caracteres"]
    },

    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: {
        values: CATEGORIAS,
        message: "La categoría seleccionada no es válida"
      }
    },

    prioridad: {
      type: String,
      required: [true, "La prioridad es obligatoria"],
      enum: {
        values: PRIORIDADES,
        message: "La prioridad seleccionada no es válida"
      }
    },

    estado: {
      type: String,
      required: true,
      enum: {
        values: ESTADOS,
        message: "El estado seleccionado no es válido"
      },
      default: "Pendiente"
    },

    historial: {
      type: [historialSchema],
      default: []
    }
  },
  {
    timestamps: {
      createdAt: "fechaCreacion",
      updatedAt: "fechaActualizacion"
    }
  }
);

const Solicitud = mongoose.model("Solicitud", solicitudSchema);

module.exports = Solicitud;