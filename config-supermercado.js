// =============================================================
//  CONFIGURACIÓN — Tema: Supermercado
//  Para usar este tema, en index.html cambiá:
//    <script src="config.js"></script>
//  por:
//    <script src="config-supermercado.js"></script>
// =============================================================
const APP_CONFIG = {
  title: "¡Ordená el supermercado!",
  subtitle: "Colocá cada producto en la góndola correcta",

  quadrants: [
    { id: "frutas",    label: "Frutas y Verduras", emoji: "🥦", color: "#43A047" },
    { id: "lacteos",   label: "Lácteos",           emoji: "🥛", color: "#039BE5" },
    { id: "carnes",    label: "Carnes",             emoji: "🥩", color: "#E53935" },
    { id: "panaderia", label: "Panadería",          emoji: "🍞", color: "#FB8C00" }
  ],

  objects: [
    // --- Frutas y Verduras ---
    { id: "manzana",   label: "Manzana",   emoji: "🍎", correct: "frutas" },
    { id: "banana",    label: "Banana",    emoji: "🍌", correct: "frutas" },
    { id: "zanahoria", label: "Zanahoria", emoji: "🥕", correct: "frutas" },
    { id: "tomate",    label: "Tomate",    emoji: "🍅", correct: "frutas" },

    // --- Lácteos ---
    { id: "leche",     label: "Leche",     emoji: "🥛", correct: "lacteos" },
    { id: "queso",     label: "Queso",     emoji: "🧀", correct: "lacteos" },
    { id: "manteca",   label: "Manteca",   emoji: "🧈", correct: "lacteos" },
    { id: "yogur",     label: "Yogur",     emoji: "🫙", correct: "lacteos" },

    // --- Carnes ---
    { id: "pollo",     label: "Pollo",     emoji: "🍗", correct: "carnes" },
    { id: "pescado",   label: "Pescado",   emoji: "🐟", correct: "carnes" },
    { id: "salchicha", label: "Salchicha", emoji: "🌭", correct: "carnes" },
    { id: "carne",     label: "Carne",     emoji: "🥩", correct: "carnes" },

    // --- Panadería ---
    { id: "pan",       label: "Pan",       emoji: "🍞", correct: "panaderia" },
    { id: "medialuna", label: "Medialuna", emoji: "🥐", correct: "panaderia" },
    { id: "torta",     label: "Torta",     emoji: "🎂", correct: "panaderia" },
    { id: "galletitas",label: "Galletitas",emoji: "🍪", correct: "panaderia" }
  ]
};
