// =============================================================
//  CONFIGURACIÓN — Tema: Mi Casa
//  Para cambiar de tema, reemplazá el src de config.js en
//  index.html por otro archivo (ej. config-supermercado.js)
// =============================================================
const APP_CONFIG = {
  title: "¿Dónde va cada cosa?",
  subtitle: "Arrastrá cada objeto al lugar correcto",

  quadrants: [
    { id: "heladera", label: "Heladera",  emoji: "🧊", color: "#2196F3" },
    { id: "despensa", label: "Despensa",  emoji: "📦", color: "#FF9800" },
    { id: "cocina",   label: "Cocina",    emoji: "🍳", color: "#E53935" },
    { id: "bano",     label: "Baño",      emoji: "🚿", color: "#00897B" }
  ],

  objects: [
    // --- Heladera ---
    { id: "leche",    label: "Leche",    emoji: "🥛", correct: "heladera" },
    { id: "manteca",  label: "Manteca",  emoji: "🧈", correct: "heladera" },
    { id: "queso",    label: "Queso",    emoji: "🧀", correct: "heladera" },
    { id: "huevos",   label: "Huevos",   emoji: "🥚", correct: "heladera" },

    // --- Despensa ---
    { id: "arroz",    label: "Arroz",    emoji: "🍚", correct: "despensa" },
    { id: "fideos",   label: "Fideos",   emoji: "🍝", correct: "despensa" },
    { id: "galletas", label: "Galletas", emoji: "🍪", correct: "despensa" },
    { id: "sal",      label: "Sal",      emoji: "🧂", correct: "despensa" },

    // --- Cocina ---
    { id: "sarten",   label: "Sartén",   emoji: "🍳", correct: "cocina" },
    { id: "cuchillo", label: "Cuchillo", emoji: "🔪", correct: "cocina" },
    { id: "taza",     label: "Taza",     emoji: "☕", correct: "cocina" },
    { id: "tenedor",  label: "Tenedor",  emoji: "🍴", correct: "cocina" },

    // --- Baño ---
    { id: "jabon",    label: "Jabón",    emoji: "🧼", correct: "bano" },
    { id: "shampoo",  label: "Shampoo",  emoji: "🧴", correct: "bano" },
    { id: "dental",   label: "Pasta dental", emoji: "🦷", correct: "bano" },
    { id: "cepillo",  label: "Cepillo",  emoji: "🪥", correct: "bano" }
  ]
};
