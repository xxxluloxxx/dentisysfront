<script setup>
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import { ref } from 'vue';

const props = defineProps({
    medicos: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    filters: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['edit', 'delete', 'export']);

const dt = ref();
const multiple = ref('multiple');

function handleEdit(medico) {
    emit('edit', medico);
}

function handleDelete(medico) {
    emit('delete', medico);
}

function exportCSV() {
    dt.value.exportCSV();
    emit('export');
}
</script>

<template>
    <div>
        <!-- Vista de escritorio -->
        <DataTable
            ref="dt"
            :value="medicos"
            dataKey="id"
            :paginator="true"
            :rows="10"
            scrollable
            scrollHeight="600px"
            :sortMode="multiple"
            :multiSortMeta="[
                { field: 'medico.nombre', order: 1 },
                { field: 'createdAt', order: 1 }
            ]"
            :filters="filters"
            :loading="loading"
            striped
            class="p-datatable-striped hidden md:block"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} medicos"
        >
            <Column field="numeroDocumento" header="Identificación" sortable style="min-width: 5rem"></Column>
            <Column field="nombreCompleto" header="Nombre Completo" sortable style="min-width: 5rem"></Column>
            <Column field="especialidad" header="Especialidad" sortable style="min-width: 5rem"></Column>
            <Column field="telefono" header="Teléfono" sortable style="min-width: 5rem"></Column>
            <Column field="email" header="Email" sortable style="min-width: 16rem"></Column>
            <Column :exportable="false" header="Acciones" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2 btn-editar" @click="handleEdit(slotProps.data)" aria-label="Editar médico" v-tooltip="'Editar médico'" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="btn-eliminar" @click="handleDelete(slotProps.data)" aria-label="Eliminar médico" v-tooltip="'Eliminar médico'" />
                </template>
            </Column>
        </DataTable>

        <!-- Vista móvil -->
        <div class="md:hidden -mx-4">
            <div class="flex flex-col gap-4">
                <!-- Header móvil con búsqueda y botones -->
                <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <h4 class="m-0 text-xl font-semibold">Médicos</h4>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex gap-2">
                            <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="flex-1 btn-nuevo-m" @click="$emit('new')" aria-label="Agregar nuevo médico" v-tooltip="'Agregar nuevo médico'" />
                            <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="flex-1 btn-exportar-m" @click="exportCSV" aria-label="Exportar médicos" v-tooltip="'Exportar médicos a CSV'" />
                        </div>
                                                    <div class="flex gap-2">
                                <div class="relative flex-1">
                                    <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" aria-label="Buscar médicos" />
                                </div>
                            </div>
                    </div>
                </div>

                <!-- Lista de médicos en tarjetas -->
                <div class="flex flex-col gap-4 w-full">
                    <div
                        v-for="medico in medicos"
                        :key="medico.id"
                        class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        @click="handleEdit(medico)"
                        tabindex="0"
                        aria-label="Editar médico {{ medico.nombre }} {{ medico.apellido }}"
                    >
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h3 class="text-lg font-semibold dark:text-white">{{ medico.nombre }} {{ medico.apellido }}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">{{ medico.especialidad }}</p>
                            </div>
                            <div class="flex gap-2">
                                <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2 btn-eliminar-m" @click.stop="handleDelete(medico)" aria-label="Eliminar médico" v-tooltip="'Eliminar médico'" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span class="font-semibold dark:text-white">Documento:</span>
                                <p class="text-gray-600 dark:text-gray-400">{{ medico.numeroDocumento }}</p>
                            </div>
                            <div>
                                <span class="font-semibold dark:text-white">Teléfono:</span>
                                <p class="text-gray-600 dark:text-gray-400">{{ medico.telefono }}</p>
                            </div>
                            <div>
                                <span class="font-semibold dark:text-white">Email:</span>
                                <p class="text-gray-600 dark:text-gray-400">{{ medico.email }}</p>
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
    background-color: rgba(0, 0, 0, 0.05);
}

:deep(.p-datatable-tbody > tr:nth-child(odd)) {
    background-color: rgba(0, 0, 0, 0.02);
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
