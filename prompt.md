Especificación: Aplicación de Categorización de Objetos

1. Descripción General
Aplicación interactiva que permite a usuarios categorizar objetos ubicándolos en su contexto correspondiente mediante un sistema de arrastrar y soltar.

2. Interfaz Visual
2.1 Área Principal
Grilla de 2×2 cuadrantes de igual tamaño que ocupan el centro de la pantalla
Cada cuadrante representa una ubicación específica (ejemplos: supermercado, casa, cocina, heladera)
Los cuadrantes son zonas interactivas donde se pueden soltar objetos
Cada cuadrante incluye una imagen de fondo o icono identificativo

2.2 Área de Objetos
Lista lateral o inferior de objetos disponibles para categorizar
Cada objeto se representa con una imagen pequeña y una etiqueta de texto
Los objetos son arrastrables hacia los cuadrantes correspondientes

3. Comportamiento
Sistema de arrastrar y soltar (drag-and-drop)
Validación: solo permite soltar un objeto en su cuadrante correcto
Feedback visual para indicar cuándo una acción es válida o inválida
Opcionalmente: cuenta o indicador de progreso al completar el ejercicio

4. Configuración
Archivo de configuración (JSON o similar) que define:
Nombres y rutas de imágenes de los cuadrantes
Lista de objetos con sus imágenes y asignación de cuadrante correcto
Etiquetas y textos de la interfaz

5. Flexibilidad
Permitir agregar/modificar cuadrantes y objetos sin cambiar el código
Soportar múltiples conjuntos de configuración para diferentes temáticas

6. Tecnologías y estilo
HTML y JAvascript.
Estilo/paradigma orientado a objetos en lugar de estructurado/basado en funciones. 
La idea es que sirva para que un estudiante programación orientada a objetos lo estudie/critique/mejore