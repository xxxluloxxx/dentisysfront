<script setup>
import { computed, ref } from 'vue';
const props = defineProps({
    numero: { type: [String, Number], required: true },
    small: { type: Boolean, default: false },
    colores: { type: Array, default: () => ['#fff', '#fff', '#fff', '#fff', '#fff'] }
});
const emit = defineEmits(['cuadrante-click']);

const size = computed(() => (props.small ? 42 : 60));
const half = computed(() => size.value / 2);
const centerSize = computed(() => (props.small ? 14 : 20));
const centerStart = computed(() => half.value - centerSize.value / 2);
const fontSize = computed(() => (props.small ? 9 : 12));

const wrapperStyle = computed(() => ({
    display: 'inline-block',
    margin: '3px',
    verticalAlign: 'middle',
    textAlign: 'center'
}));

const numeroStyle = computed(() => ({
    fontWeight: 'bold',
    fontSize: fontSize.value + 'px',
    marginBottom: '2px',
    lineHeight: 1
}));

// Estado de selección de cuadrantes (4 triángulos + centro), ahora con 3 estados: 0=sin selección, 1=azul, 2=rojo
const seleccionados = ref([0, 0, 0, 0, 0]);

function toggleCuadrante(cuadrante) {
    // Avanza el estado: 0 -> 1 -> 2 -> 0
    seleccionados.value[cuadrante - 1] = (seleccionados.value[cuadrante - 1] + 1) % 3;
    emit('cuadrante-click', {
        cuadrante,
        estado: seleccionados.value[cuadrante - 1]
    });
}

function cuadranteFill(cuadrante) {
    const estado = seleccionados.value[cuadrante - 1];
    if (estado === 1) return '#1976d2'; // azul
    if (estado === 2) return '#d32f2f'; // rojo
    // Sin selección
    return cuadranteColors.value[cuadrante - 1];
}

// Colores alternos para mejor visualización
const cuadranteColors = computed(() => [
    '#e8f5e9', // verde claro
    '#e8f5e9', // verde claro
    '#e8f5e9', // verde claro
    '#e8f5e9', // verde claro
    '#e8f5e9' // verde claro para el centro
]);

// Líneas diagonales desde los vértices del cuadrado central hasta los vértices del cuadrado exterior
const diagonalLines = computed(() => {
    const h = half.value;
    const s = size.value;
    const c = centerSize.value / 2;
    // Vértices del cuadrado central
    const cent = [
        { x: h - c, y: h - c }, // superior izquierda
        { x: h + c, y: h - c }, // superior derecha
        { x: h + c, y: h + c }, // inferior derecha
        { x: h - c, y: h + c } // inferior izquierda
    ];
    // Vértices del cuadrado exterior
    const ext = [
        { x: 0, y: 0 }, // superior izquierda
        { x: s, y: 0 }, // superior derecha
        { x: s, y: s }, // inferior derecha
        { x: 0, y: s } // inferior izquierda
    ];
    // Líneas de cada vértice central al correspondiente exterior
    return [
        { x1: cent[0].x, y1: cent[0].y, x2: ext[0].x, y2: ext[0].y },
        { x1: cent[1].x, y1: cent[1].y, x2: ext[1].x, y2: ext[1].y },
        { x1: cent[2].x, y1: cent[2].y, x2: ext[2].x, y2: ext[2].y },
        { x1: cent[3].x, y1: cent[3].y, x2: ext[3].x, y2: ext[3].y }
    ];
});

// Devuelve el path SVG para cada triángulo
function getTrianglePath(cuadrante) {
    const h = half.value;
    const s = size.value;
    switch (cuadrante) {
        case 1: // superior izquierdo
            return `M${h},${h} L0,0 L${s},0 Z`;
        case 2: // superior derecho
            return `M${h},${h} L${s},0 L${s},${s} Z`;
        case 3: // inferior derecho
            return `M${h},${h} L${s},${s} L0,${s} Z`;
        case 4: // inferior izquierdo
            return `M${h},${h} L0,${s} L0,0 Z`;
        default:
            return '';
    }
}
</script>

<template>
    <div :style="wrapperStyle">
        <div :style="numeroStyle" class="numero-diente">{{ numero }}</div>
        <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
            <!-- Cuadrante superior izquierdo (triángulo) -->
            <path @click="toggleCuadrante(1)" :fill="cuadranteFill(1)" :d="getTrianglePath(1)" stroke="#333" stroke-width="1" style="cursor: pointer" />
            <!-- Cuadrante superior derecho (triángulo) -->
            <path @click="toggleCuadrante(2)" :fill="cuadranteFill(2)" :d="getTrianglePath(2)" stroke="#333" stroke-width="1" style="cursor: pointer" />
            <!-- Cuadrante inferior derecho (triángulo) -->
            <path @click="toggleCuadrante(3)" :fill="cuadranteFill(3)" :d="getTrianglePath(3)" stroke="#333" stroke-width="1" style="cursor: pointer" />
            <!-- Cuadrante inferior izquierdo (triángulo) -->
            <path @click="toggleCuadrante(4)" :fill="cuadranteFill(4)" :d="getTrianglePath(4)" stroke="#333" stroke-width="1" style="cursor: pointer" />
            <!-- Cuadrado central -->
            <rect @click="toggleCuadrante(5)" :x="centerStart" :y="centerStart" :width="centerSize" :height="centerSize" :fill="cuadranteFill(5)" stroke="#333" stroke-width="1" style="cursor: pointer" />
            <!-- Borde exterior (cuadrado) -->
            <rect :x="0" :y="0" :width="size" :height="size" fill="none" stroke="black" stroke-width="2" />
            <!-- Líneas diagonales desde el centro hasta los vértices -->
            <line v-for="(line, idx) in diagonalLines" :key="idx" :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" stroke="#333" stroke-width="2" />
        </svg>
    </div>
</template>

<style scoped>
svg:hover {
    filter: drop-shadow(0 0 4px #888);
}
.numero-diente {
    font-weight: bold;
    color: #333;
    font-size: inherit;
    margin-bottom: 2px;
    line-height: 1;
}
@media (prefers-color-scheme: dark) {
    .numero-diente {
        color: #fff;
    }
}
</style>
