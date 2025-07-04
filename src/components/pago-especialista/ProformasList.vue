<template>
    <div class="proformas-list-container">
        <!-- Header con título y búsqueda -->
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold" style="color: var(--text-color);">
                <i class="pi pi-file-text mr-2"></i>
                Proformas del Paciente
            </h2>
            <div class="flex items-center gap-3">
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText
                        :model-value="searchTerm"
                        @update:model-value="updateSearchTerm"
                        placeholder="Buscar proformas..."
                        class="w-80"
                        :disabled="loading"
                    />
                </span>
                <Button
                    icon="pi pi-refresh"
                    @click="cargarProformas"
                    :loading="loading"
                    severity="secondary"
                    text
                    rounded
                />
            </div>
        </div>

        <!-- Información del paciente -->
        <div v-if="selectedPaciente" class="patient-info-card mb-4">
            <div class="flex items-center gap-3">
                <div class="patient-avatar">
                    <i class="pi pi-user text-xl"></i>
                </div>
                <div>
                    <h3 class="font-semibold" style="color: var(--text-color);">
                        {{ selectedPaciente.nombre }} {{ selectedPaciente.apellido }}
                    </h3>
                    <p class="text-sm" style="color: var(--text-color-secondary);">
                        ID: {{ selectedPaciente.identificacion }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Contador de resultados -->
        <div class="mb-3">
            <span class="text-sm" style="color: var(--text-color-secondary);">
                {{ filteredProformas.length }} proforma{{ filteredProformas.length !== 1 ? 's' : '' }} encontrada{{ filteredProformas.length !== 1 ? 's' : '' }}
            </span>
        </div>

        <!-- Lista de proformas -->
        <div class="proformas-grid">
            <div
                v-for="proforma in filteredProformas"
                :key="proforma.id"
                class="proforma-card"
                :class="{ 'selected': selectedProforma?.id === proforma.id }"
                @click="seleccionarProforma(proforma)"
            >
                <div class="proforma-header">
                    <div class="proforma-avatar">
                        <i class="pi pi-fw pi-book text-2xl"></i>
                    </div>
                    <div class="proforma-info">
                        <h3 class="proforma-numero">
                            Proforma #{{ proforma.numero || proforma.id }}
                        </h3>
                        <p class="proforma-estado">
                            <i class="pi pi-circle-fill mr-1" :class="getEstadoClass(proforma.estado)"></i>
                            {{ proforma.estado || 'Sin estado' }}
                        </p>
                    </div>
                    <div class="proforma-status" v-if="selectedProforma?.id === proforma.id">
                        <i class="pi pi-check-circle text-xl"></i>
                    </div>
                </div>

                <div class="proforma-details">
                    <div class="detail-item">
                        <i class="pi pi-calendar mr-2 text-gray-500"></i>
                        <span>{{ formatCreatedAt(proforma.createdAt) || 'Sin fecha' }}</span>
                    </div>
                    <div class="detail-item">
                        <i class="pi pi-dollar mr-2 text-gray-500"></i>
                        <span>{{ formatCurrency(proforma.total) || 'Sin total' }}</span>
                    </div>
                    <div class="detail-item">
                        <i class="pi pi-file-text mr-2 text-gray-500"></i>
                        <span>{{ proforma.observaciones || 'Sin observaciones' }}</span>
                    </div>
                </div>

                <div class="proforma-actions">
                    <Button
                        :label="selectedProforma?.id === proforma.id ? 'Seleccionada' : 'Seleccionar'"
                        :icon="selectedProforma?.id === proforma.id ? 'pi pi-check' : 'pi pi-plus'"
                        :severity="selectedProforma?.id === proforma.id ? 'success' : 'primary'"
                        size="small"
                        @click.stop="seleccionarProforma(proforma)"
                    />
                </div>
            </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="loading" class="loading-container">
            <ProgressSpinner />
            <p class="mt-3" style="color: var(--text-color-secondary);">Cargando proformas...</p>
        </div>

        <!-- Estado vacío -->
        <div v-else-if="filteredProformas.length === 0" class="empty-state">
            <i class="pi pi-file-text text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">
                {{ searchTerm ? 'No se encontraron proformas' : 'No hay proformas registradas' }}
            </h3>
            <p class="text-gray-500">
                {{ searchTerm ? 'Intenta con otros términos de búsqueda' : 'Las proformas aparecerán aquí cuando se registren' }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';

// Props
const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    proformas: {
        type: Array,
        default: () => []
    },
    selectedPaciente: {
        type: Object,
        default: null
    },
    selectedProforma: {
        type: Object,
        default: null
    },
    searchTerm: {
        type: String,
        default: ''
    }
});

// Emits
const emit = defineEmits(['select-proforma', 'cargar-proformas', 'update:searchTerm']);

// Computed
const filteredProformas = computed(() => {
    if (!props.searchTerm) return props.proformas;

    return props.proformas.filter(proforma =>
        proforma.numero?.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
        proforma.estado?.toLowerCase().includes(props.searchTerm.toLowerCase())
    );
});

// Methods
function seleccionarProforma(proforma) {
    emit('select-proforma', proforma);
}

function cargarProformas() {
    emit('cargar-proformas');
}

function updateSearchTerm(value) {
    emit('update:searchTerm', value);
}

function getEstadoClass(estado) {
    switch (estado?.toLowerCase()) {
        case 'pendiente':
            return 'text-yellow-500';
        case 'aprobada':
            return 'text-green-500';
        case 'rechazada':
            return 'text-red-500';
        case 'pagada':
            return 'text-blue-500';
        default:
            return 'text-gray-500';
    }
}

function formatDate(dateString) {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function formatCreatedAt(createdAt) {
    if (!createdAt) return null;
    try {
        // Extraer solo la fecha de createdAt (formato: "2025-07-02T13:19:59.801663")
        return createdAt.split('T')[0];
    } catch (error) {
        return createdAt;
    }
}

function formatCurrency(amount) {
    if (!amount) return null;
    try {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    } catch (error) {
        return amount.toString();
    }
}

// Lifecycle
onMounted(() => {
    if (props.proformas.length === 0 && props.selectedPaciente) {
        cargarProformas();
    }
});
</script>

<style scoped>
.proformas-list-container {
    @apply p-6 rounded-lg shadow-sm;
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
}

.patient-info-card {
    @apply p-4 rounded-lg;
    background-color: var(--surface-hover);
    border: 1px solid var(--surface-border);
}

.patient-avatar {
    @apply w-10 h-10 rounded-full flex items-center justify-center;
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

.proformas-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.proforma-card {
    @apply rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md;
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
}

.proforma-card:hover {
    border-color: var(--primary-color);
    background-color: var(--surface-hover);
}

.proforma-card.selected {
    border-color: var(--primary-color);
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

.proforma-card.selected .proforma-numero,
.proforma-card.selected .proforma-estado,
.proforma-card.selected .detail-item {
    color: var(--primary-contrast-color);
}

.proforma-header {
    @apply flex items-center gap-3 mb-3;
}

.proforma-avatar {
    @apply w-12 h-12 rounded-full flex items-center justify-center;
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

.proforma-info {
    @apply flex-1;
}

.proforma-numero {
    @apply font-semibold text-lg;
    color: var(--text-color);
}

.proforma-estado {
    @apply text-sm;
    color: var(--text-color-secondary);
}

.proforma-status {
    @apply flex items-center;
}

.proforma-details {
    @apply space-y-2 mb-4;
}

.detail-item {
    @apply flex items-center text-sm;
    color: var(--text-color-secondary);
}

.proforma-actions {
    @apply flex justify-end;
}

.loading-container {
    @apply flex flex-col items-center justify-center py-12;
}

.empty-state {
    @apply flex flex-col items-center justify-center py-12 text-center;
}

.empty-state i {
    color: var(--text-color-secondary);
}

.empty-state h3 {
    color: var(--text-color);
}

.empty-state p {
    color: var(--text-color-secondary);
}
</style>
