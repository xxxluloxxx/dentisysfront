<template>
    <div class="medicos-list-container">
        <!-- Header con título y búsqueda -->
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold" style="color: var(--text-color);">
                <i class="pi pi-user-md mr-2"></i>
                Especialistas
            </h2>
            <div class="flex items-center gap-3">
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText
                        :model-value="searchTerm"
                        @update:model-value="updateSearchTerm"
                        placeholder="Buscar especialistas..."
                        class="w-80"
                        :disabled="loading"
                    />
                </span>
                <Button
                    icon="pi pi-refresh"
                    @click="cargarMedicos"
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
                {{ filteredMedicos.length }} especialista{{ filteredMedicos.length !== 1 ? 's' : '' }} encontrado{{ filteredMedicos.length !== 1 ? 's' : '' }}
            </span>
        </div>

        <!-- Lista de médicos -->
        <div class="medicos-grid">
            <div
                v-for="medico in filteredMedicos"
                :key="medico.id"
                class="medico-card"
                :class="{ 'selected': selectedMedico?.id === medico.id }"
                @click="seleccionarMedico(medico)"
            >
                <div class="medico-header">
                    <div class="medico-avatar">
                        <i class="pi pi-user text-2xl"></i>
                    </div>
                    <div class="medico-info">
                        <h3 class="medico-nombre">
                            Dr. {{ medico.nombre }} {{ medico.apellido }}
                        </h3>
                        <p class="medico-especialidad">
                            <i class="pi pi-briefcase mr-1"></i>
                            {{ medico.especialidad || 'Sin especialidad' }}
                        </p>
                    </div>
                    <div class="medico-status" v-if="selectedMedico?.id === medico.id">
                        <i class="pi pi-check-circle text-xl"></i>
                    </div>
                </div>

                <div class="medico-details">
                    <div class="detail-item">
                        <i class="pi pi-id-card mr-2 text-gray-500"></i>
                        <span>{{ medico.numeroDocumento || 'Sin documento' }}</span>
                    </div>
                    <div class="detail-item">
                        <i class="pi pi-envelope mr-2 text-gray-500"></i>
                        <span>{{ medico.email || 'Sin email' }}</span>
                    </div>
                    <div class="detail-item">
                        <i class="pi pi-phone mr-2 text-gray-500"></i>
                        <span>{{ medico.telefono || 'Sin teléfono' }}</span>
                    </div>
                </div>

                <div class="medico-actions">
                    <Button
                        :label="selectedMedico?.id === medico.id ? 'Seleccionado' : 'Seleccionar'"
                        :icon="selectedMedico?.id === medico.id ? 'pi pi-check' : 'pi pi-plus'"
                        :severity="selectedMedico?.id === medico.id ? 'success' : 'primary'"
                        size="small"
                        @click.stop="seleccionarMedico(medico)"
                    />
                </div>
            </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="loading" class="loading-container">
            <ProgressSpinner />
            <p class="mt-3" style="color: var(--text-color-secondary);">Cargando especialistas...</p>
        </div>

        <!-- Estado vacío -->
        <div v-else-if="filteredMedicos.length === 0" class="empty-state">
            <i class="pi pi-user-md text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">
                {{ searchTerm ? 'No se encontraron especialistas' : 'No hay especialistas registrados' }}
            </h3>
            <p class="text-gray-500">
                {{ searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los especialistas aparecerán aquí cuando se registren' }}
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
    medicos: {
        type: Array,
        default: () => []
    },
    selectedMedico: {
        type: Object,
        default: null
    },
    searchTerm: {
        type: String,
        default: ''
    }
});

// Emits
const emit = defineEmits(['select-medico', 'cargar-medicos', 'update:searchTerm']);

// Computed
const filteredMedicos = computed(() => {
    if (!props.searchTerm) return props.medicos;

    return props.medicos.filter(medico =>
        medico.nombre?.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
        medico.apellido?.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
        medico.especialidad?.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
        medico.numeroDocumento?.includes(props.searchTerm)
    );
});

// Methods
function seleccionarMedico(medico) {
    emit('select-medico', medico);
}

function cargarMedicos() {
    emit('cargar-medicos');
}

function updateSearchTerm(value) {
    emit('update:searchTerm', value);
}

// Lifecycle
onMounted(() => {
    if (props.medicos.length === 0) {
        cargarMedicos();
    }
});
</script>

<style scoped>
.medicos-list-container {
    @apply p-6 rounded-lg shadow-sm;
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
}

.medicos-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.medico-card {
    @apply rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md;
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
}

.medico-card:hover {
    border-color: var(--primary-color);
    background-color: var(--surface-hover);
}

.medico-card.selected {
    border-color: var(--primary-color);
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

.medico-card.selected .medico-nombre,
.medico-card.selected .medico-especialidad,
.medico-card.selected .detail-item {
    color: var(--primary-contrast-color);
}

.medico-header {
    @apply flex items-center gap-3 mb-3;
}

.medico-avatar {
    @apply w-12 h-12 rounded-full flex items-center justify-center;
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

.medico-info {
    @apply flex-1;
}

.medico-nombre {
    @apply font-semibold text-lg;
    color: var(--text-color);
}

.medico-especialidad {
    @apply text-sm;
    color: var(--text-color-secondary);
}

.medico-status {
    @apply flex items-center;
}

.medico-details {
    @apply space-y-2 mb-4;
}

.detail-item {
    @apply flex items-center text-sm;
    color: var(--text-color-secondary);
}

.medico-actions {
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
