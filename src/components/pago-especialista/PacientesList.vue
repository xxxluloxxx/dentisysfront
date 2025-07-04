<template>
    <div class="pacientes-list-container">
        <!-- Header con título y búsqueda -->
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold" style="color: var(--text-color);">
                <i class="pi pi-users mr-2"></i>
                Pacientes
            </h2>
            <div class="flex items-center gap-3">
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText
                        :model-value="searchTerm"
                        @update:model-value="updateSearchTerm"
                        placeholder="Buscar pacientes..."
                        class="w-80"
                        :disabled="loading"
                    />
                </span>
                <Button
                    icon="pi pi-refresh"
                    @click="cargarPacientes"
                    :loading="loading"
                    severity="secondary"
                    text
                    rounded
                />
            </div>
        </div>

        <!-- Contador de resultados -->
        <div class="mb-3">
            <span class="text-sm" style="color: var(--text-color-secondary);">
                Mostrando {{ filteredPacientes.length }} de {{ props.pacientes.length }} paciente{{ props.pacientes.length !== 1 ? 's' : '' }}
                {{ props.searchTerm ? 'que coinciden con la búsqueda' : '' }}
                {{ props.pacientes.length > 6 ? ' (máximo 6 mostrados)' : '' }}
            </span>
        </div>

        <!-- Lista de pacientes -->
        <div class="pacientes-grid">
            <div
                v-for="paciente in filteredPacientes"
                :key="paciente.id"
                class="paciente-card"
                :class="{ 'selected': selectedPaciente?.id === paciente.id }"
                @click="seleccionarPaciente(paciente)"
            >
                <div class="paciente-header">
                    <div class="paciente-avatar">
                        <i class="pi pi-user text-2xl"></i>
                    </div>
                    <div class="paciente-info">
                        <h3 class="paciente-nombre">
                            {{ paciente.nombre }} {{ paciente.apellido }}
                        </h3>
                        <p class="paciente-identificacion">
                            <i class="pi pi-id-card mr-1"></i>
                            {{ paciente.identificacion }}
                        </p>
                    </div>
                    <div class="paciente-status" v-if="selectedPaciente?.id === paciente.id">
                        <i class="pi pi-check-circle text-xl"></i>
                    </div>
                </div>

                <div class="paciente-details">
                    <div class="detail-item">
                        <i class="pi pi-phone mr-2 text-gray-500"></i>
                        <span>{{ paciente.telefono || 'Sin teléfono' }}</span>
                    </div>
                    <div class="detail-item">
                        <i class="pi pi-envelope mr-2 text-gray-500"></i>
                        <span>{{ paciente.email || 'Sin email' }}</span>
                    </div>
                    <div class="detail-item">
                        <i class="pi pi-map-marker mr-2 text-gray-500"></i>
                        <span>{{ paciente.direccion || 'Sin dirección' }}</span>
                    </div>
                </div>

                <div class="paciente-actions">
                    <Button
                        :label="selectedPaciente?.id === paciente.id ? 'Seleccionado' : 'Seleccionar'"
                        :icon="selectedPaciente?.id === paciente.id ? 'pi pi-check' : 'pi pi-plus'"
                        :severity="selectedPaciente?.id === paciente.id ? 'success' : 'primary'"
                        size="small"
                        @click.stop="seleccionarPaciente(paciente)"
                    />
                </div>
            </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="loading" class="loading-container">
            <ProgressSpinner />
            <p class="mt-3" style="color: var(--text-color-secondary);">Cargando pacientes...</p>
        </div>

        <!-- Estado vacío -->
        <div v-else-if="filteredPacientes.length === 0" class="empty-state">
            <i class="pi pi-users text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">
                {{ searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados' }}
            </h3>
            <p class="text-gray-500">
                {{ searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los pacientes aparecerán aquí cuando se registren' }}
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
    pacientes: {
        type: Array,
        default: () => []
    },
    selectedPaciente: {
        type: Object,
        default: null
    },
    searchTerm: {
        type: String,
        default: ''
    }
});

// Emits
const emit = defineEmits(['select-paciente', 'cargar-pacientes', 'update:searchTerm']);

// Computed
const filteredPacientes = computed(() => {
    let filtered = props.pacientes;

    if (props.searchTerm) {
        filtered = props.pacientes.filter(paciente =>
            paciente.nombre?.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
            paciente.apellido?.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
            paciente.identificacion?.includes(props.searchTerm)
        );
    }

    // Limitar a máximo 6 pacientes
    return filtered.slice(0, 6);
});

// Methods
function seleccionarPaciente(paciente) {
    emit('select-paciente', paciente);
}

function cargarPacientes() {
    emit('cargar-pacientes');
}

function updateSearchTerm(value) {
    emit('update:searchTerm', value);
}

// Lifecycle
onMounted(() => {
    if (props.pacientes.length === 0) {
        cargarPacientes();
    }
});
</script>

<style scoped>
.pacientes-list-container {
    @apply p-6 rounded-lg shadow-sm;
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
}

.pacientes-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.paciente-card {
    @apply rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md;
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
}

.paciente-card:hover {
    border-color: var(--primary-color);
    background-color: var(--surface-hover);
}

.paciente-card.selected {
    border-color: var(--primary-color);
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

.paciente-card.selected .paciente-nombre,
.paciente-card.selected .paciente-identificacion,
.paciente-card.selected .detail-item {
    color: var(--primary-contrast-color);
}

.paciente-header {
    @apply flex items-center gap-3 mb-3;
}

.paciente-avatar {
    @apply w-12 h-12 rounded-full flex items-center justify-center;
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

.paciente-info {
    @apply flex-1;
}

.paciente-nombre {
    @apply font-semibold text-lg;
    color: var(--text-color);
}

.paciente-identificacion {
    @apply text-sm;
    color: var(--text-color-secondary);
}

.paciente-status {
    @apply flex items-center;
}

.paciente-details {
    @apply space-y-2 mb-4;
}

.detail-item {
    @apply flex items-center text-sm;
    color: var(--text-color-secondary);
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
