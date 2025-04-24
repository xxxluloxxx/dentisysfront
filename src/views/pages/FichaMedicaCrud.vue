<script setup>
import { FichaService } from '@/service/FichaMedica';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const dt = ref();
const fichas = ref();
const fichaDialog = ref(false);
const deleteFichaDialog = ref(false);
const loading = ref(true);
const multiple = ref('multiple');
const ficha = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const activeTab = ref('0'); // Por defecto mostrar hoy
const sortOrder = ref(1); // 1 para ascendente (más antiguas primero)

const options = [
    { label: 'Hoy', value: '0' },
    { label: 'Últimos 7 días', value: '1' },
    { label: 'Todos', value: '2' }
];

const toggleSort = () => {
    sortOrder.value *= -1;
};

// Añadir función de filtrado
const filteredFichas = computed(() => {
    if (!fichas.value) return [];

    let filtered = [...fichas.value];

    // Filtro por búsqueda global
    if (filters.value.global.value) {
        const searchTerm = filters.value.global.value.toLowerCase();
        filtered = filtered.filter(
            (ficha) =>
                ficha.medico?.nombre?.toLowerCase().includes(searchTerm) ||
                ficha.medico?.apellido?.toLowerCase().includes(searchTerm) ||
                ficha.paciente?.nombre?.toLowerCase().includes(searchTerm) ||
                ficha.paciente?.apellido?.toLowerCase().includes(searchTerm)
        );
    }

    // Filtro por fecha
    if (activeTab.value !== '2') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filtered = filtered.filter((ficha) => {
            const fichaDate = new Date(ficha.createdAt);
            fichaDate.setHours(0, 0, 0, 0);

            if (activeTab.value === '0') {
                // Hoy
                return fichaDate.getTime() === today.getTime();
            } else if (activeTab.value === '1') {
                // Últimos 7 días
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                return fichaDate >= sevenDaysAgo && fichaDate <= today;
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
    FichaService.getAll()
        .then((data) => (fichas.value = data))
        .catch((error) => {
            console.error('Error al cargar los productos:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
});

function hideDialog() {
    fichaDialog.value = false;
    submitted.value = false;
}

function verFicha(fichaData) {
    router.push({
        name: 'ficha-vista',
        params: { id: fichaData.id }
    });
}

function confirmDeleteFicha(fichaData) {
    ficha.value = fichaData;
    deleteFichaDialog.value = true;
}

function deleteFicha() {
    FichaService.deleteProduct(ficha.value.id)
        .then(() => {
            fichas.value = fichas.value.filter((val) => val.id !== ficha.value.id);
            deleteFichaDialog.value = false;
            ficha.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto Eliminado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar el producto:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el producto', life: 3000 });
        });
}

function exportCSV() {
    dt.value.exportCSV();
}

function obtenerFecha(value) {
    if (value) {
        const fecha = new Date(value);
        return fecha.toISOString().split('T')[0];
    }
    return '';
}
</script>

<template>
    <div>
        <div class="card">
            <!-- Vista de escritorio -->
            <DataTable
                ref="dt"
                :value="filteredFichas"
                dataKey="id"
                :paginator="true"
                :rows="10"
                scrollable
                scrollHeight="600px"
                :sortMode="multiple"
                :multiSortMeta="[
                    { field: 'createdAt', order: 1 },
                    { field: 'medico.nombre', order: 1 }
                ]"
                :filters="filters"
                :loading="loading"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} fichas"
                class="hidden md:block"
            >
                <template #header>
                    <div class="flex flex-col gap-y-4">
                        <div class="flex flex-wrap gap-2 items-center justify-start">
                            <h4 class="m-0">Fichas médicas</h4>
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
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
                                <Button :icon="sortOrder === -1 ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-up'" severity="secondary" @click="toggleSort" class="p-2" />
                            </div>
                        </div>
                    </div>
                </template>

                <Column field="createdAt" header="Fecha " sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        {{ obtenerFecha(slotProps.data.createdAt) }}
                    </template>
                </Column>
                <Column field="medico.nombre" header="Medico" sortable style="min-width: 12rem">
                    <template #body="slotProps"> {{ slotProps.data.medico.nombre }} {{ slotProps.data.medico.apellido }} </template>
                </Column>
                <Column field="paciente.nombre" header="Paciente" sortable style="min-width: 12rem">
                    <template #body="slotProps"> {{ slotProps.data.paciente.nombre }} {{ slotProps.data.paciente.apellido }} </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="verFicha(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" severity="warn" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteFicha(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <!-- Vista móvil -->
            <div class="md:hidden -mx-4">
                <div class="flex flex-col gap-4">
                    <!-- Header móvil con búsqueda y botones -->
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between">
                            <h4 class="m-0 text-xl font-semibold">Fichas médicas</h4>
                        </div>
                        <div class="flex flex-col gap-2">
                            <div class="flex gap-2">
                                <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="flex-1" @click="exportCSV($event)" />
                            </div>
                            <SelectButton v-model="activeTab" :options="options" optionLabel="label" optionValue="value" class="w-full" />
                            <div class="flex gap-2">
                                <div class="relative flex-1">
                                    <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" />
                                </div>
                                <Button :icon="sortOrder === -1 ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-up'" severity="secondary" @click="toggleSort" class="p-2" />
                            </div>
                        </div>
                    </div>

                    <!-- Lista de fichas en tarjetas -->
                    <div class="flex flex-col gap-4 w-full">
                        <div v-for="ficha in filteredFichas" :key="ficha.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="text-lg font-semibold dark:text-white">Fecha: {{ obtenerFecha(ficha.createdAt) }}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Médico: {{ ficha.medico.nombre }} {{ ficha.medico.apellido }}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Paciente: {{ ficha.paciente.nombre }} {{ ficha.paciente.apellido }}</p>
                                </div>
                                <div class="flex gap-2">
                                    <Button icon="pi pi-eye" outlined rounded class="p-2" @click="verFicha(ficha)" />
                                    <Button icon="pi pi-pencil" outlined rounded severity="warn" class="p-2" @click="editProduct(ficha)" />
                                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2" @click="confirmDeleteFicha(ficha)" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="fichaDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Detalles de la ficha" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="nombre" class="block font-bold mb-2">Nombre</label>
                        <InputText id="nombre" v-model.trim="ficha.nombre" required="true" autofocus :invalid="submitted && !ficha.nombre" class="w-full" />
                        <small v-if="submitted && !ficha.nombre" class="text-red-500">El nombre es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="description" class="block font-bold mb-2">Descripción</label>
                        <Textarea id="description" v-model="ficha.descripcion" required="true" rows="3" cols="20" class="w-full" />
                    </div>
                </div>

                <div class="field">
                    <label for="categoria" class="block font-bold mb-2">Categoria</label>
                    <InputText id="categoria" v-model.trim="ficha.categoria" required="true" autofocus :invalid="submitted && !ficha.categoria" class="w-full" />
                    <small v-if="submitted && !ficha.categoria" class="text-red-500">La categoría es requerida.</small>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="codigo" class="block font-bold mb-2">Código</label>
                        <InputText id="codigo" v-model.trim="ficha.codigo" required="true" autofocus :invalid="submitted && !ficha.codigo" class="w-full" />
                        <small v-if="submitted && !ficha.codigo" class="text-red-500">El código es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="price" class="block font-bold mb-2">Precio</label>
                        <InputNumber id="price" v-model="ficha.precio" mode="currency" currency="USD" locale="en-US" class="w-full" />
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                    <Button label="Guardar" icon="pi pi-check" @click="saveProduct" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteFichaDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="ficha"
                    >¿Estás seguro de querer eliminar esta ficha <b>{{ ficha.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteFichaDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteFicha" />
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