<script setup>
import { CuentasService } from '@/service/CuentasService';
import { MedicoService } from '@/service/MedicoService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// Toast para notificaciones
const toast = useToast();

// Estados reactivos
const medicos = ref([]);
const pagos = ref([]);
const selectedMedico = ref(null);
const loading = ref(false);
const loadingPagos = ref(false);
const searchTerm = ref('');

// Computed properties
const filteredMedicos = computed(() => {
    if (!searchTerm.value) return medicos.value;

    return medicos.value.filter(
        (medico) => medico.nombre?.toLowerCase().includes(searchTerm.value.toLowerCase()) || medico.apellido?.toLowerCase().includes(searchTerm.value.toLowerCase()) || medico.especialidad?.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
});

const totalPagos = computed(() => {
    return pagos.value.reduce((total, pago) => total + pago.monto, 0);
});

// Funciones
async function cargarMedicos() {
    try {
        loading.value = true;
        const data = await MedicoService.getAll();
        medicos.value = data;
    } catch (error) {
        console.error('Error al cargar médicos:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar los médicos',
            life: 4000
        });
    } finally {
        loading.value = false;
    }
}

async function cargarPagos(medicoId) {
    try {
        loadingPagos.value = true;
        const data = await CuentasService.getByMedicoId(medicoId);
        pagos.value = data;
    } catch (error) {
        console.error('Error al cargar pagos:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar los pagos del médico',
            life: 4000
        });
        pagos.value = [];
    } finally {
        loadingPagos.value = false;
    }
}

function seleccionarMedico(medico) {
    selectedMedico.value = medico;
    cargarPagos(medico.id);
}

function limpiarSeleccion() {
    selectedMedico.value = null;
    pagos.value = [];
}

function getSeverity(categoria) {
    const categorias = {
        'Gastos especialistas': 'warning',
        Ingresos: 'success',
        'Gastos generales': 'danger'
    };
    return categorias[categoria] || 'info';
}

// Cargar datos al montar el componente
onMounted(() => {
    cargarMedicos();
});
</script>

<template>
    <div class="pagos-container">
        <!-- Header -->
        <div class="header-section">
            <div class="flex items-center gap-3 mb-6">
                <i class="pi pi-credit-card text-3xl" style="color: var(--primary-color)"></i>
                <div>
                    <h1 class="text-3xl font-bold" style="color: var(--text-color)">Gestión de Pagos</h1>
                    <p style="color: var(--text-color-secondary)">Consulta los pagos realizados por especialista</p>
                </div>
            </div>
        </div>

        <!-- Búsqueda -->
        <div class="search-section mb-6">
            <div class="flex items-center gap-4">
                <div class="search-input-container flex-1">
                    <i class="pi pi-search search-icon" />
                    <InputText v-model="searchTerm" placeholder="Buscar médicos por nombre o especialidad..." class="w-full" />
                </div>
                <Button icon="pi pi-refresh" @click="cargarMedicos" :loading="loading" severity="secondary" text rounded />
            </div>
        </div>

        <!-- Spinner de carga global -->
        <div v-if="loading" class="loading-container">
            <ProgressSpinner style="width: 60px; height: 60px" strokeWidth="4" />
            <p class="mt-3 text-gray-600">Cargando médicos...</p>
        </div>

        <!-- Lista de médicos -->
        <div v-else class="medicos-section">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold" style="color: var(--text-color)">Especialistas ({{ filteredMedicos.length }})</h2>
                <Button v-if="selectedMedico" label="Limpiar selección" icon="pi pi-times" @click="limpiarSeleccion" severity="secondary" text />
            </div>

            <div class="medicos-grid">
                <Card v-for="medico in filteredMedicos" :key="medico.id" class="medico-card" :class="{ selected: selectedMedico?.id === medico.id }" @click="seleccionarMedico(medico)">
                    <template #header>
                        <div class="medico-header">
                            <div class="medico-avatar">
                                <i class="pi pi-user text-2xl"></i>
                            </div>
                            <div class="medico-info">
                                <h3 class="medico-nombre">Dr. {{ medico.nombre }} {{ medico.apellido }}</h3>
                                <p class="medico-especialidad">
                                    <i class="pi pi-briefcase mr-1"></i>
                                    {{ medico.especialidad || 'Sin especialidad' }}
                                </p>
                            </div>
                            <div v-if="selectedMedico?.id === medico.id" class="selection-indicator">
                                <i class="pi pi-check-circle text-xl text-primary"></i>
                            </div>
                        </div>
                    </template>

                    <template #content>
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
                    </template>

                    <template #footer>
                        <Button
                            :label="selectedMedico?.id === medico.id ? 'Seleccionado' : 'Ver pagos'"
                            :icon="selectedMedico?.id === medico.id ? 'pi pi-check' : 'pi pi-eye'"
                            :severity="selectedMedico?.id === medico.id ? 'success' : 'primary'"
                            class="w-full"
                            @click.stop="seleccionarMedico(medico)"
                        />
                    </template>
                </Card>
            </div>

            <!-- Estado vacío -->
            <div v-if="filteredMedicos.length === 0" class="empty-state">
                <i class="pi pi-user text-6xl mb-4" style="color: var(--surface-border)"></i>
                <h3 class="text-xl font-semibold mb-2" style="color: var(--text-color)">
                    {{ searchTerm ? 'No se encontraron médicos' : 'No hay médicos registrados' }}
                </h3>
                <p style="color: var(--text-color-secondary)">
                    {{ searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los médicos aparecerán aquí cuando se registren' }}
                </p>
            </div>
        </div>

        <!-- Sección de pagos -->
        <div v-if="selectedMedico" class="pagos-section mt-8">
            <Card>
                <template #header>
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-semibold" style="color: var(--text-color)">Pagos de Dr. {{ selectedMedico.nombre }} {{ selectedMedico.apellido }}</h2>
                            <p class="text-lg font-medium" style="color: var(--primary-color)">{{ selectedMedico.especialidad }}</p>
                        </div>
                    </div>
                </template>

                <template #content>
                    <div v-if="loadingPagos" class="loading-pagos">
                        <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="3" />
                        <p class="mt-2 text-gray-600">Cargando pagos...</p>
                    </div>

                    <div v-else-if="pagos.length === 0" class="empty-pagos">
                        <i class="pi pi-credit-card text-4xl mb-3" style="color: var(--surface-border)"></i>
                        <h3 class="text-lg font-semibold mb-1" style="color: var(--text-color)">No hay pagos registrados</h3>
                        <p style="color: var(--text-color-secondary)">Este médico aún no tiene pagos registrados en el sistema</p>
                    </div>

                    <DataTable
                        v-else
                        :value="pagos"
                        :paginator="true"
                        :rows="10"
                        striped
                        class="pagos-table"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25]"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pagos"
                    >
                        <Column field="fechaMovimiento" header="Fecha" sortable style="min-width: 120px">
                            <template #body="{ data }">
                                {{ formatDate(data.fechaMovimiento) }}
                            </template>
                        </Column>

                        <Column field="categoriaNombre" header="Categoría" sortable style="min-width: 150px">
                            <template #body="{ data }">
                                <Tag :value="data.categoriaNombre" :severity="getSeverity(data.categoriaNombre)" />
                            </template>
                        </Column>

                        <Column field="descripcion" header="Descripción" sortable style="min-width: 200px">
                            <template #body="{ data }">
                                <div class="descripcion-cell">
                                    <p class="font-medium" style="color: var(--text-color)">{{ data.descripcion }}</p>
                                </div>
                            </template>
                        </Column>

                        <Column field="monto" header="Monto" sortable style="min-width: 120px">
                            <template #body="{ data }">
                                <span class="font-bold text-lg" :style="{ color: data.monto >= 0 ? 'var(--green-500)' : 'var(--red-500)' }">
                                    {{ formatCurrency(data.monto) }}
                                </span>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.pagos-container {
    @apply p-6;
}

.header-section {
    border-bottom: 1px solid var(--surface-border);
    @apply pb-4;
}

.search-section {
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
    @apply rounded-lg p-4 shadow-sm;
}

.search-input-container {
    position: relative;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color-secondary);
    z-index: 1;
}

.search-input-container .p-inputtext {
    padding-left: 40px;
}

.loading-container {
    @apply flex flex-col items-center justify-center py-12;
}

.loading-container p {
    color: var(--text-color-secondary);
}

.medicos-section {
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
    @apply rounded-lg p-6 shadow-sm;
}

.medicos-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.medico-card {
    @apply cursor-pointer transition-all duration-200 hover:shadow-lg;
    border: 2px solid transparent;
    background-color: var(--surface-card);
}

.medico-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
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
    @apply flex items-center gap-3;
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
    @apply text-lg font-semibold mb-1;
    color: var(--text-color);
}

.medico-especialidad {
    @apply text-sm opacity-80;
    color: var(--text-color-secondary);
}

.selection-indicator {
    color: var(--primary-color);
}

.medico-details {
    @apply space-y-2;
}

.detail-item {
    @apply flex items-center text-sm;
    color: var(--text-color-secondary);
}

.detail-item i {
    color: var(--text-color-secondary);
}

.empty-state {
    @apply flex flex-col items-center justify-center py-12 text-center;
}

.empty-state i {
    color: var(--surface-border);
}

.empty-state h3 {
    color: var(--text-color);
}

.empty-state p {
    color: var(--text-color-secondary);
}

.pagos-section {
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
    @apply rounded-lg shadow-sm;
}

.loading-pagos {
    @apply flex flex-col items-center justify-center py-8;
}

.loading-pagos p {
    color: var(--text-color-secondary);
}

.empty-pagos {
    @apply flex flex-col items-center justify-center py-8 text-center;
}

.empty-pagos i {
    color: var(--surface-border);
}

.empty-pagos h3 {
    color: var(--text-color);
}

.empty-pagos p {
    color: var(--text-color-secondary);
}

.pagos-table {
    @apply mt-4;
}

.descripcion-cell {
    @apply space-y-1;
}

.descripcion-cell p:first-child {
    color: var(--text-color);
}

.descripcion-cell p:last-child {
    color: var(--text-color-secondary);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .medicos-grid {
        @apply grid-cols-1;
    }

    .pagos-container {
        @apply p-4;
    }
}
</style>
