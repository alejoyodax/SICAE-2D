# SICAE-2D: Simulador Interactivo de Campos Eléctricos

<div align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

**SICAE-2D** es una aplicación web interactiva que visualiza campos eléctricos generados por cargas puntuales en 2D, implementando la Ley de Coulomb.

</div>

---

## 📋 Descripción

SICAE-2D es un simulador educativo que permite visualizar en tiempo real cómo se comportan los campos eléctricos alrededor de cargas eléctricas puntuales. La aplicación calcula el campo eléctrico en una grilla de puntos utilizando la Ley de Coulomb y lo representa mediante vectores direccionales.

### Características principales

- **Visualización interactiva** de campos eléctricos en 2D
- **Agregar y eliminar cargas** dinámicamente en tiempo real
- **Arrastrar cargas** para ver cómo el campo se actualiza instantáneamente
- **Cargas positivas y negativas** con renderizado diferenciado
- **Ajuste de parámetros**: constante de Coulomb (K), opacidad, magnitud máxima
- **Rendimiento optimizado** con cálculos throttled durante arrastres

---

## 🚀 Instalación y Uso

### Requisitos previos

- Node.js 18+ 
- npm o yarn

### Descarga e instalación

1. **Clonar o descargar el proyecto:**
```bash
git clone https://github.com/tu-usuario/SICAE-2D.git
cd SICAE-2D
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Uso

#### En pantalla
- **Agregar cargas**: Click en el botón "+ Positiva" o "+ Negativa" en la esquina superior derecha
- **Mover cargas**: Arrastra los círculos (las cargas) a la posición deseada
- **Eliminar cargas**: Click sobre la carga que desees remover
- **Visualización**: Las flechas representan la dirección y magnitud del campo eléctrico

#### Parámetros ajustables
- **K (Constante de Coulomb)**: Intensidad del campo (default: 100)
- **Min/Max Opacidad**: Rango de transparencia de las flechas
- **Magnitud Máxima**: Normaliza la visualización del campo

---

## 🏗️ Construcción del Proyecto

### Paso 1: Configuración base
El proyecto fue inicializado con **Vite + React + TypeScript** para obtener:
- Hot Module Replacement (HMR) rápido durante desarrollo
- Bundling optimizado para producción
- Type-safety completo con TypeScript

### Paso 2: Selección de librerías
- **React-Konva**: Librería de canvas 2D que permite renderizar miles de elementos eficientemente
- **Bulma**: Framework CSS minimalista para la interfaz de usuario
- **Konva**: Motor gráfico subyacente con soporte para transformaciones, eventos y animaciones

### Paso 3: Modelado de datos
Se definieron dos interfaces principales que modelan los conceptos físicos del simulador:

```typescript
// Representa una carga puntual
interface Carga {
  posicion: { x: number; y: number };      // Coordenadas en pantalla (px)
  magnitud: number;                         // Valor de la carga (en unidades arbitrarias)
  signo: 'positiva' | 'negativa';          // Polaridad de la carga
}

// Representa un punto de muestreo en la grilla
interface CeldaGrilla {
  posicion: { x: number; y: number };       // Coordenadas en pantalla (px)
  direccion: { ux: number; uy: number };   // Vector unitario normalizado
  magnitud: number;                         // Intensidad del campo (N/C)
}
```

### Paso 4: Implementación del cálculo físico
Se implementó el algoritmo de cálculo del campo eléctrico basado en la Ley de Coulomb:

$$E = \frac{k \cdot q}{r^2}$$

Donde:
- **E** = magnitud del campo eléctrico
- **k** = constante de Coulomb (configurable)
- **q** = magnitud de la carga
- **r** = distancia desde la carga al punto

### Paso 5: Renderizado optimizado
Se utilizó un sistema de capas (Layers) en Konva para:
- **Capa 1**: Cargas interactivas (círculos)
- **Capa 2**: Vectores del campo (flechas) y puntos de campo nulo

---

## 🎯 Decisiones de Arquitectura

### Estructura de datos: `CeldaGrilla`

**Por qué esta estructura:**

1. **Separación de posición y dirección**: Almacenar `posicion` y `direccion` por separado permite:
   - Cálculos vectoriales limpios
   - Búsquedas espaciales eficientes si fuera necesario
   - Normalizar dirección independientemente de magnitud

2. **Vector unitario normalizado**: `{ ux: number; uy: number }`
   - Facilita representar dirección sin información de magnitud
   - Permite escalar la visualización sin afectar cálculos
   - Operaciones vectoriales precisas (ej: suma de campos)

3. **Magnitud separada**:
   - Permite mapear magnitud a propiedades visuales (opacidad, tamaño)
   - Facilita detectar campos nulos (`magnitud < 0.001`)
   - Mejora la precisión numérica en cálculos

### Estructura de datos: `Carga`

**Por qué esta estructura:**

1. **Campo `signo` como string enum**:
   ```typescript
   signo: 'positiva' | 'negativa'
   ```
   - Type-safe (evita valores inválidos)
   - Auto-documenta el significado físico
   - Facilita renderizado diferenciado por color

2. **Magnitud como número positivo**:
   - El signo determina la polaridad, no la magnitud
   - Simplifica cálculos: `const signo = carga.signo === 'negativa' ? -1 : 1`
   - Permite valores intuitivos (ej: magnitud 5, no -5)

3. **Posición como objeto `{ x, y }`**:
   - Compatibilidad inmediata con APIs de canvas (Konva)
   - Operaciones vectoriales legibles: `dx = punto.x - carga.x`
   - Escalable a 3D en futuras versiones

### Grilla de puntos: `CeldaGrilla[]`

**Ventajas de usar Array en lugar de Map o Grid**:

1. **Rendimiento en canvas**: Konva renderiza listas de manera eficiente
2. **Iteración secuencial**: `celdas.map()` se traduce directamente en `{celdas.map(...)}`
3. **Simplicidad**: Fácil de serializar, debuggear y optimizar

**Espaciado uniforme (100px default)**:
- Balance entre precisión visual y rendimiento
- Suficiente para visualizar gradientes suaves
- Reduce cálculos: ~150-200 puntos vs 1M píxeles

---

## 🔬 Algoritmos principales

### Cálculo del campo en un punto

```typescript
const calcularCampoEnPunto = (
  posicionPunto: { x: number; y: number },
  carga: Carga,
  k: number = 100
): { magnitud: number; direccion: { ux: number; uy: number } } => {
  // Vector desde carga al punto
  const dx = posicionPunto.x - carga.posicion.x;
  const dy = posicionPunto.y - carga.posicion.y;
  const distancia = Math.sqrt(dx * dx + dy * dy);

  // Evitar división por cero
  if (distancia < 1) return { magnitud: 0, direccion: { ux: 0, uy: 0 } };

  // Magnitud: E = k*q/r²
  const magnitudCampo = (k * carga.magnitud) / (distancia * distancia);

  // Dirección normalizada considerando el signo
  const signo = carga.signo === 'negativa' ? -1 : 1;
  const ux = (signo * dx) / distancia;
  const uy = (signo * dy) / distancia;

  return { magnitud: magnitudCampo, direccion: { ux, uy } };
};
```

**Complejidad**: O(1) por punto

### Superposición de campos

```typescript
const calcularCampoTotal = (
  posicionPunto: { x: number; y: number },
  cargas: Carga[],
  k: number = 100
) => {
  let Ex = 0, Ey = 0;

  // Sumar componentes x e y de cada carga
  for (const carga of cargas) {
    const campo = calcularCampoEnPunto(posicionPunto, carga, k);
    Ex += campo.direccion.ux * campo.magnitud;
    Ey += campo.direccion.uy * campo.magnitud;
  }

  // Magnitud resultante y normalización
  const magnitud = Math.sqrt(Ex * Ex + Ey * Ey);
  return {
    magnitud,
    direccion: magnitud > 0.0001 ? 
      { ux: Ex / magnitud, uy: Ey / magnitud } : 
      { ux: 0, uy: 0 }
  };
};
```

**Complejidad**: O(n·m) donde n = celdas, m = cargas

### Actualización de grilla

```typescript
const actualizarGrilla = (
  celdas: CeldaGrilla[], 
  cargas: Carga[], 
  k: number = 100
): CeldaGrilla[] => {
  return celdas.map((celda) => {
    const campo = calcularCampoTotal(celda.posicion, cargas, k);
    return {
      ...celda,
      magnitud: campo.magnitud,
      direccion: campo.direccion,
    };
  });
};
```

**Estrategia de optimización**: 
- Solo recalcula al terminar arrastres (`onDragEnd`)
- Usa `useRef` para acceder a posiciones sin re-renderizar durante arrastres
- Evita cálculos redundantes con refs locales

---

## 📦 Dependencias

```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "react-konva": "^19.2.3",
  "konva": "^10.2.3",
  "bulma": "^1.0.4"
}
```

| Librería | Propósito |
|----------|-----------|
| React | Estado y renderizado de componentes |
| React-Konva | Wrapper declarativo para Konva en React |
| Konva | Canvas 2D de alto rendimiento |
| Bulma | Estilos CSS sin configuración |

---

## 🛠️ Scripts disponibles

```bash
npm run dev      # Inicia servidor Vite en desarrollo
npm run build    # Compila TypeScript y construye con Vite
npm run preview  # Vista previa de la build de producción
npm run lint     # Ejecuta ESLint
```

---

## 📱 Interfaz de usuario

### Panel de control (esquina superior derecha)
- **Botones de carga**: Agregar cargas positivas/negativas
- **Sliders**:
  - K: Ajusta la intensidad del campo (0-200)
  - Min Opacity: Opacidad mínima de flechas
  - Max Opacity: Opacidad máxima de flechas
  - Max Magnitud: Normaliza la escala visual
- **Reset Grid**: Reinicia la simulación

### Información en tiempo real
- Posición del cursor
- Cantidad de cargas y celdas activas
- Colores de cargas: Rojo = negativa, Azul = positiva

---

## 🎓 Conceptos educativos

SICAE-2D visualiza conceptos clave de electromagnetismo:

- **Ley de Coulomb**: Interacción entre cargas
- **Superposición de campos**: Suma vectorial de campos
- **Vectores de campo**: Dirección y magnitud en cada punto
- **Cargas puntuales**: Idealizaciones de distribuciones de carga
- **Simetría**: Patrones de campo alrededor de cargas

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💻 Desarrollo

### Stack tecnológico
- **Frontend**: React 19 + TypeScript
- **Build tool**: Vite
- **Visualización**: Konva Canvas
- **Linting**: ESLint

### Estructura del proyecto
```
SICAE-2D/
├── src/
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   ├── components/
│   │   └── Navbar.component/
│   │       └── Navbar.component.tsx
│   ├── App.css
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Próximas mejoras

- [ ] Agregar campos eléctricos uniformes
- [ ] Lineas equipotenciales
- [ ] Exportar/importar configuraciones de cargas
- [ ] Modo 3D
- [ ] Animación de partículas de prueba
- [ ] Integración con WebGL para mayor rendimiento
- [ ] Soporte para distribuciones de carga continuas

---

## 📧 Contacto y contribuciones

Para reportar bugs, sugerir mejoras o contribuir, contacta al desarrollador o crea un issue en el repositorio.
