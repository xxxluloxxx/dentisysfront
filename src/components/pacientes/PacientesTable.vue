<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import { computed, ref } from 'vue';

// Props que recibe del componente padre
const props = defineProps({
    pacientes: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    }
});

// Emits para comunicarse con el componente padre
const emit = defineEmits(['edit', 'delete', 'export', 'new']);

// Referencias
const dt = ref();
const sortOrder = ref('asc');

// Filtros
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Filtrado y ordenamiento unificado
const filteredPacientes = computed(() => {
    if (!props.pacientes) return [];
    let result = [...props.pacientes];

    if (filters.value.global.value) {
        const searchTerm = filters.value.global.value.toLowerCase();
        result = result.filter(
            (p) =>
                p.nombre?.toLowerCase().includes(searchTerm) ||
                p.apellido?.toLowerCase().includes(searchTerm) ||
                p.identificacion?.toLowerCase().includes(searchTerm) ||
                p.email?.toLowerCase().includes(searchTerm) ||
                p.telefono?.toLowerCase().includes(searchTerm) ||
                p.direccion?.toLowerCase().includes(searchTerm)
        );
    }

    result.sort((a, b) => {
        const nombreA = (a.nombre + ' ' + a.apellido).toLowerCase();
        const nombreB = (b.nombre + ' ' + b.apellido).toLowerCase();
        return sortOrder.value === 'asc' ? nombreA.localeCompare(nombreB) : nombreB.localeCompare(nombreA);
    });

    return result;
});

// Métodos
function toggleSort() {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
}

function handleEdit(paciente) {
    emit('edit', paciente);
}

function handleDelete(paciente) {
    emit('delete', paciente);
}

function handleExport() {
    dt.value.exportCSV();
    emit('export');
}
</script>

<template>
    <div class="card">
        <!-- Header mejorado -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 mb-4 rounded-t-lg">
            <div class="flex items-center gap-3">
                <i class="pi pi-users text-2xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white m-0">Pacientes</h2>
            </div>
            <div class="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                <div class="flex gap-2 w-full md:w-auto">
                    <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="btn-nuevo font-semibold px-4 py-2" @click="$emit('new')" aria-label="Agregar nuevo paciente" v-tooltip="'Agregar nuevo paciente'" />
                    <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="btn-exportar font-semibold px-4 py-2" @click="handleExport" aria-label="Exportar pacientes" v-tooltip="'Exportar pacientes a CSV'" />
                </div>
                <div class="relative flex-1 md:w-64">
                    <IconField class="w-full">
                        <InputIcon>
                            <i class="pi pi-search text-blue-500" />
                        </InputIcon>
                        <InputText
                            v-model="filters['global'].value"
                            placeholder="Buscar pacientes..."
                            aria-label="Buscar pacientes"
                            class="w-full pl-10 py-2 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        />
                    </IconField>
                </div>
            </div>
        </div>

        <!-- Vista de escritorio -->
        <DataTable
            ref="dt"
            :value="filteredPacientes"
            dataKey="id"
            :paginator="true"
            :rows="10"
            scrollable
            scrollHeight="600px"
            :filters="filters"
            :loading="loading"
            striped
            class="p-datatable-striped hidden md:block"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pacientes"
        >
            <Column field="identificacion" header="Identificación" sortable style="min-width: 5rem"></Column>
            <Column field="apellido" header="Apellido" sortable style="min-width: 5rem"></Column>
            <Column field="nombre" header="Nombre" sortable style="min-width: 5rem"></Column>
            <Column field="genero" header="Género" sortable style="min-width: 8rem">
                <template #body="slotProps">
                    <span :class="slotProps.data.genero === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'" class="px-2 py-1 rounded-full text-sm font-medium">
                        {{ slotProps.data.genero }}
                    </span>
                </template>
            </Column>
            <Column field="email" header="Email" sortable style="min-width: 16rem"></Column>
            <Column field="telefono" header="Teléfono" sortable style="min-width: 12rem"></Column>
            <Column field="direccion" header="Dirección" sortable style="min-width: 12rem"></Column>
            <Column field="fechaNacimiento" header="Fecha nacimiento" sortable style="min-width: 12rem"></Column>
            <Column :exportable="false" style="min-width: 12rem" class="text-primary-600 dark:text-primary-400 font-bold">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2 btn-editar" @click="handleEdit(slotProps.data)" aria-label="Editar paciente" v-tooltip="'Editar paciente'" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="btn-eliminar" @click="handleDelete(slotProps.data)" aria-label="Eliminar paciente" v-tooltip="'Eliminar paciente'" />
                </template>
            </Column>
        </DataTable>

        <!-- Vista móvil -->
        <div class="md:hidden -mx-4">
            <div class="flex flex-col gap-4">
                <!-- Header móvil con búsqueda y botones -->
                <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <h4 class="m-0 text-xl font-semibold">Pacientes</h4>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex gap-2">
                            <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="flex-1 btn-nuevo-m" @click="$emit('new')" aria-label="Agregar nuevo paciente" v-tooltip="'Agregar nuevo paciente'" />
                            <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="flex-1 btn-exportar-m" @click="handleExport" aria-label="Exportar pacientes" v-tooltip="'Exportar pacientes a CSV'" />
                        </div>
                        <div class="flex gap-2">
                            <div class="relative flex-1">
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" aria-label="Buscar pacientes" />
                            </div>
                            <Button :icon="sortOrder === 'asc' ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-up'" severity="secondary" @click="toggleSort" class="p-2" aria-label="Ordenar alfabéticamente" v-tooltip="'Ordenar alfabéticamente'" />
                        </div>
                    </div>
                </div>

                <!-- Lista de pacientes en tarjetas -->
                <div class="flex flex-col gap-4 w-full">
                    <div
                        v-for="paciente in filteredPacientes"
                        :key="paciente.id"
                        class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        @click="handleEdit(paciente)"
                        tabindex="0"
                        :aria-label="`Editar paciente ${paciente.nombre} ${paciente.apellido}`"
                    >
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h3 class="text-lg font-semibold dark:text-white">{{ paciente.nombre }} {{ paciente.apellido }}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">ID: {{ paciente.identificacion }}</p>
                            </div>
                            <div class="flex gap-2">
                                <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2 btn-eliminar-m" @click.stop="handleDelete(paciente)" aria-label="Eliminar paciente" v-tooltip="'Eliminar paciente'" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span class="font-semibold dark:text-white">Email:</span>
                                <p class="text-gray-600 dark:text-gray-400">{{ paciente.email }}</p>
                            </div>
                            <div>
                                <span class="font-semibold dark:text-white">Teléfono:</span>
                                <p class="text-gray-600 dark:text-gray-400">{{ paciente.telefono }}</p>
                            </div>
                            <div>
                                <span class="font-semibold dark:text-white">Género:</span>
                                <p class="text-gray-600 dark:text-gray-400">
                                    <span :class="paciente.genero === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                                        {{ paciente.genero }}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <span class="font-semibold dark:text-white">Dirección:</span>
                                <p class="text-gray-600 dark:text-gray-400">{{ paciente.direccion }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Estilos personalizados para las filas alternadas de las tablas */
:deep(.p-datatable-tbody > tr:nth-child(even)) {
    background-color: rgba(0, 0, 0, 0.04);
}

:deep(.p-datatable-tbody > tr:nth-child(odd)) {
    background-color: rgba(0, 0, 0, 0.01);
}

/* Estilo para resaltar la fila al pasar el cursor */
:deep(.p-datatable-tbody > tr:hover) {
    background-color: rgba(0, 132, 255, 0.1) !important;
    cursor: pointer;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
    transition:
        background 0.2s,
        box-shadow 0.2s;
}

/* Estilo para los encabezados de las tablas */
:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: var(--primary-color);
    color: var(--primary-color-text);
    font-weight: bold;
}

/* Estilo para las celdas de las tablas */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.7rem 0.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* Botones de acción */
.btn-editar,
.btn-eliminar,
.btn-nuevo,
.btn-exportar,
.btn-nuevo-m,
.btn-exportar-m {
    transition:
        box-shadow 0.2s,
        transform 0.2s;
    box-shadow: 0 1px 4px 0 rgba(59, 130, 246, 0.08);
    border-radius: 50px;
}
.btn-editar:hover,
.btn-nuevo:hover,
.btn-nuevo-m:hover {
    background: #e0f2fe !important;
    color: #2563eb !important;
    transform: translateY(-2px) scale(1.05);
}
.btn-eliminar:hover,
.btn-eliminar-m:hover {
    background: #fee2e2 !important;
    color: #b91c1c !important;
    transform: translateY(-2px) scale(1.05);
}
.btn-exportar:hover,
.btn-exportar-m:hover {
    background: #fef9c3 !important;
    color: #ca8a04 !important;
    transform: translateY(-2px) scale(1.05);
}

/* Tarjetas móviles */
.bg-white {
    background: linear-gradient(135deg, #f8fafc 80%, #e0e7ef 100%);
}
.dark .bg-white,
.dark\:bg-gray-800 {
    background: linear-gradient(135deg, #1e293b 80%, #334155 100%);
}
.shadow {
    box-shadow: 0 2px 12px 0 rgba(59, 130, 246, 0.1);
}

/* Mejorar tooltips */
:deep(.p-tooltip) {
    font-size: 1rem;
    border-radius: 6px;
    background: #2563eb;
    color: #fff;
    padding: 0.5em 1em;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}
</style>
