<script setup>
import { ProformaService } from '@/service/ProformaService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const dt = ref();
const proformas = ref([]);
const loading = ref(true);
const deleteproformaDialog = ref(false);
const proforma = ref({});
const expandedRows = ref([]);
const multiple = ref('multiple');
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const activeTab = ref('0'); // Por defecto mostrar hoy
const sortOrder = ref(-1);
const router = useRouter();

const options = [
    { label: 'Hoy', value: '0' },
    { label: 'Últimos 7 días', value: '1' },
    { label: 'Todos', value: '2' }
];

const toggleSort = () => {
    sortOrder.value *= -1;
};

// Añadir función de filtrado
const filteredProformas = computed(() => {
    if (!proformas.value) return [];

    let filtered = [...proformas.value];

    // Filtro por búsqueda global
    if (filters.value.global.value) {
        const searchTerm = filters.value.global.value.toLowerCase();
        filtered = filtered.filter((proforma) => proforma.medicoNombre?.toLowerCase().includes(searchTerm) || proforma.pacienteNombre?.toLowerCase().includes(searchTerm) || proforma.estado?.toLowerCase().includes(searchTerm));
    }

    // Filtro por fecha
    if (activeTab.value !== '2') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filtered = filtered.filter((proforma) => {
            const proformaDate = new Date(proforma.createdAt);
            proformaDate.setHours(0, 0, 0, 0);

            if (activeTab.value === '0') {
                // Hoy
                return proformaDate.getTime() === today.getTime();
            } else if (activeTab.value === '1') {
                // Últimos 7 días
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                return proformaDate >= sevenDaysAgo && proformaDate <= today;
            }
            return true;
        });
    }

    // Aplicar ordenamiento por fecha
    return filtered.sort((a, b) => {
        const fechaA = new Date(a.createdAt);
        const fechaB = new Date(b.createdAt);
        return (fechaB - fechaA) * sortOrder.value;
    });
});

onMounted(() => {
    loading.value = true;
    ProformaService.getAllDetalles()
        .then((data) => (proformas.value = data))
        .catch((error) => {
            console.error('Error al cargar las proformas:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
});

function formatCurrency(value) {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return;
}

function obtenerFecha(value) {
    if (value) {
        const fecha = new Date(value);
        return fecha.toISOString().split('T')[0];
    }
    return '';
}

function obtenerHora(value) {
    if (value) {
        const fecha = new Date(value);
        return fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    return '';
}

function confirmDeleteProforma(proformaData) {
    proforma.value = proformaData;
    deleteproformaDialog.value = true;
}

function editProforma(proforma) {
    router.push(`/pages/proformaVista/${proforma.id}`);
}

function deleteProforma() {
    if (!proforma.value || !proforma.value.id) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'ID de proforma no válido', life: 3000 });
        return;
    }

    console.log('Eliminando proforma con ID:', proforma.value.id);
    ProformaService.delete(proforma.value.id)
        .then(() => {
            proformas.value = proformas.value.filter((val) => val.id !== proforma.value.id);
            deleteproformaDialog.value = false;
            proforma.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Proforma Eliminada', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar la proforma:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar la proforma', life: 3000 });
        });
}

function exportCSV() {
    dt.value.exportCSV();
}

function getEstadoSeverity(estado) {
    switch (estado) {
        case 'PAGADA':
            return 'success';
        case 'PENDIENTE':
            return 'warn';
        case 'CANCELADA':
            return 'danger';
        default:
            return null;
    }
}

function expandAll() {
    expandedRows.value = proformas.value.reduce((acc, p) => (acc[p.id] = true) && acc, {});
}

function collapseAll() {
    expandedRows.value = {};
}

function toggleExpand(proformaId) {
    expandedRows.value[proformaId] = !expandedRows.value[proformaId];
}
</script>

<template>
    <div>
        <div class="card">
            <!-- Vista de escritorio -->
            <DataTable
                ref="dt"
                v-model:expandedRows="expandedRows"
                :value="filteredProformas"
                :loading="loading"
                :paginator="true"
                :rows="10"
                scrollable
                scrollHeight="600px"
                :sortMode="multiple"
                :multiSortMeta="[
                    { field: 'createdAt', order: 1 },
                    { field: 'medicoNombre', order: 1 },
                    { field: 'pacienteNombre', order: 1 }
                ]"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proformas"
                dataKey="id"
                tableStyle="min-width: 60rem"
                class="hidden md:block"
            >
                <template #header>
                    <div class="flex flex-col gap-y-4">
                        <div class="flex flex-wrap gap-2 items-center justify-start">
                            <h4 class="m-0">Proformas</h4>
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <div class="flex flex-wrap justify-end gap-2">
                                <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" />
                                <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
                            </div>
                            <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <SelectButton v-model="activeTab" :options="options" optionLabel="label" optionValue="value" />
                            <div class="flex gap-2">
                                <IconField>
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                                </IconField>
                            </div>
                        </div>
                    </div>
                </template>

                <Column expander style="width: 5rem" />
                <Column field="createdAt" header="Fecha" sortable style="min-width: 1rem">
                    <template #body="slotProps">
                        {{ obtenerFecha(slotProps.data.createdAt) }}
                    </template>
                </Column>
                <Column field="createdAt" header="Hora" sortable style="min-width: 1rem">
                    <template #body="slotProps">
                        {{ obtenerHora(slotProps.data.createdAt) }}
                    </template>
                </Column>
                <Column field="medicoNombre" header="Medico" sortable style="min-width: 1rem"></Column>
                <Column field="pacienteNombre" header="Paciente" sortable style="min-width: 1rem"></Column>

                <Column field="subtotal" header="Subtotal">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.subtotal) }}
                    </template>
                </Column>
                <Column field="iva" header="IVA" sortable style="min-width: 1rem"></Column>
                <Column field="total" header="Total">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.total) }}
                    </template>
                </Column>
                <Column header="Estado" sortable style="min-width: 1rem" sortField="estado" :sortFunction="(a, b) => a.estado.localeCompare(b.estado)">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.estado" :severity="getEstadoSeverity(slotProps.data.estado)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="editProforma(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" severity="warn" @click="editProforma(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProforma(slotProps.data)" />
                    </template>
                </Column>
                <template #expansion="slotProps">
                    <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
                        <h5 class="text-gray-900 dark:text-white mb-4 font-semibold">Productos de la proforma</h5>
                        <DataTable :value="slotProps.data.detalles" class="bg-transparent">
                            <Column field="productoNombre" header="Producto" sortable></Column>
                            <Column field="precioUnitario" header="Precio" sortable>
                                <template #body="slotProps">
                                    {{ formatCurrency(slotProps.data.precioUnitario) }}
                                </template>
                            </Column>
                            <Column field="cantidad" header="Cantidad" sortable></Column>
                            <Column field="subtotal" header="Subtotal" sortable>
                                <template #body="slotProps">
                                    {{ formatCurrency(slotProps.data.subtotal) }}
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </DataTable>

            <!-- Vista móvil -->
            <div class="md:hidden -mx-4">
                <div class="flex flex-col gap-4">
                    <!-- Header móvil con búsqueda y botones -->
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between">
                            <h4 class="m-0 text-xl font-semibold">Proformas</h4>
                        </div>
                        <div class="flex flex-col gap-2">
                            <div class="flex gap-2">
                                <Button text icon="pi pi-plus" label="Expand All" class="flex-1" @click="expandAll" />
                                <Button text icon="pi pi-minus" label="Collapse All" class="flex-1" @click="collapseAll" />
                                <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="flex-1" @click="exportCSV($event)" />
                            </div>
                            <SelectButton v-model="activeTab" :options="options" optionLabel="label" optionValue="value" class="w-full" />
                            <div class="flex gap-2 w-full">
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" />
                                <Button :icon="sortOrder === -1 ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-up'" severity="secondary" @click="toggleSort" class="p-2" />
                            </div>
                        </div>
                    </div>

                    <!-- Lista de proformas en tarjetas -->
                    <div class="flex flex-col gap-4 w-full">
                        <div v-for="proforma in filteredProformas" :key="proforma.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="text-lg font-semibold dark:text-white">{{ proforma.medicoNombre }}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Paciente: {{ proforma.pacienteNombre }}</p>
                                </div>
                                <div class="flex gap-2">
                                    <Button icon="pi pi-eye" outlined rounded class="p-2" @click="editProforma(proforma)" />
                                    <Button icon="pi pi-pencil" outlined rounded severity="warn" class="p-2" @click="editProforma(proforma)" />
                                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2" @click="confirmDeleteProforma(proforma)" />
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span class="font-semibold dark:text-white">Fecha:</span>
                                    <p class="text-gray-600 dark:text-gray-400">{{ obtenerFecha(proforma.createdAt) }}</p>
                                </div>
                                <div>
                                    <span class="font-semibold dark:text-white">Estado:</span>
                                    <Tag :value="proforma.estado" :severity="getEstadoSeverity(proforma.estado)" />
                                </div>
                                <div>
                                    <span class="font-semibold dark:text-white">Subtotal:</span>
                                    <p class="text-gray-600 dark:text-gray-400">{{ formatCurrency(proforma.subtotal) }}</p>
                                </div>
                                <div>
                                    <span class="font-semibold dark:text-white">IVA:</span>
                                    <p class="text-gray-600 dark:text-gray-400">{{ proforma.iva }}%</p>
                                </div>
                                <div>
                                    <span class="font-semibold dark:text-white">Total:</span>
                                    <p class="text-gray-600 dark:text-gray-400">{{ formatCurrency(proforma.total) }}</p>
                                </div>
                            </div>
                            <!-- Botón para expandir/colapsar -->
                            <div class="mt-4 flex justify-center">
                                <Button :icon="expandedRows[proforma.id] ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" text @click="toggleExpand(proforma.id)" class="w-full" />
                            </div>
                            <!-- Detalles expandibles -->
                            <div v-if="expandedRows[proforma.id]" class="mt-4">
                                <h5 class="font-semibold mb-2">Productos de la proforma</h5>
                                <div class="grid gap-2">
                                    <div v-for="detalle in proforma.detalles" :key="detalle.id" class="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                        <div class="grid grid-cols-2 gap-2">
                                            <div>
                                                <span class="font-semibold">Producto:</span>
                                                <p>{{ detalle.productoNombre }}</p>
                                            </div>
                                            <div>
                                                <span class="font-semibold">Precio:</span>
                                                <p>{{ formatCurrency(detalle.precioUnitario) }}</p>
                                            </div>
                                            <div>
                                                <span class="font-semibold">Cantidad:</span>
                                                <p>{{ detalle.cantidad }}</p>
                                            </div>
                                            <div>
                                                <span class="font-semibold">Subtotal:</span>
                                                <p>{{ formatCurrency(detalle.subtotal) }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="deleteproformaDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="proforma">¿Estás seguro de querer eliminar esta proforma?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteproformaDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteProforma" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
/* Estilos personalizados para las filas alternadas de las tablas */
:deep(.p-datatable-tbody > tr:nth-child(even)) {
    background-color: rgba(0, 0, 0, 0.05);
}

:deep(.p-datatable-tbody > tr:nth-child(odd)) {
    background-color: rgba(0, 0, 0, 0.02);
}

/* Estilo para resaltar la fila al pasar el cursor */
:deep(.p-datatable-tbody > tr:hover) {
    background-color: rgba(0, 0, 0, 0.1) !important;
    cursor: pointer;
}

/* Estilo para los encabezados de las tablas */
:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: var(--primary-color);
    color: var(--primary-color-text);
    font-weight: bold;
}

/* Estilo para las celdas de las tablas */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.5rem;
}
</style>
@/service/ProformaService
