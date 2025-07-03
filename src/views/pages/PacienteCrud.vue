<script setup>
import { PacienteService } from '@/service/PacienteService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const pacientes = ref([]);
const loading = ref(true);
const pacienteDialog = ref(false);
const deletePacienteDialog = ref(false);
const paciente = ref({});
const sortOrder = ref('asc');
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const isSaving = ref(false);

onMounted(() => {
    cargarPacientes();
});

function cargarPacientes() {
    loading.value = true;
    PacienteService.getAll()
        .then((data) => (pacientes.value = data))
        .catch((error) => {
            console.error('Error al cargar los pacientes:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 4000 });
        })
        .finally(() => {
            loading.value = false;
        });
}

// Filtrado y ordenamiento unificado
const filteredPacientes = computed(() => {
    if (!pacientes.value) return [];
    let result = [...pacientes.value];
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

function toggleSort() {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
}

function openNew() {
    paciente.value = {};
    submitted.value = false;
    pacienteDialog.value = true;
}

function hideDialog() {
    pacienteDialog.value = false;
    submitted.value = false;
}

function savePaciente() {
    submitted.value = true;
    if (!paciente.value.nombre?.trim() || !paciente.value.apellido?.trim() || !paciente.value.identificacion?.trim() || !paciente.value.direccion?.trim() || !paciente.value.genero) {
        toast.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Por favor, complete todos los campos obligatorios.', life: 3500 });
        return;
    }
    isSaving.value = true;
    const pacienteData = {
        nombre: paciente.value.nombre,
        apellido: paciente.value.apellido,
        email: paciente.value.email,
        telefono: paciente.value.telefono,
        direccion: paciente.value.direccion,
        genero: paciente.value.genero,
        identificacion: paciente.value.identificacion,
        fechaNacimiento: paciente.value.fechaNacimiento
    };
    if (paciente.value.id) {
        updatePaciente(pacienteData);
    } else {
        createPaciente(pacienteData);
    }
}

function createPaciente(pacienteData) {
    PacienteService.create(pacienteData)
        .then((response) => {
            pacientes.value.push(response);
            pacienteDialog.value = false;
            paciente.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente creado correctamente', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al crear el paciente:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el paciente', life: 4000 });
        })
        .finally(() => {
            isSaving.value = false;
        });
}

function updatePaciente(pacienteData) {
    PacienteService.update(paciente.value.id, pacienteData)
        .then((response) => {
            const index = findIndexById(paciente.value.id);
            if (index !== -1) {
                pacientes.value[index] = response;
            }
            pacienteDialog.value = false;
            paciente.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente actualizado correctamente', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al actualizar el paciente:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el paciente', life: 4000 });
        })
        .finally(() => {
            isSaving.value = false;
        });
}

function editPaciente(cli) {
    if (cli) {
        paciente.value = { ...cli };
        pacienteDialog.value = true;
    }
}

function confirmDeletePaciente(cli) {
    paciente.value = cli;
    deletePacienteDialog.value = true;
}

function deletePaciente() {
    PacienteService.delete(paciente.value.id)
        .then(() => {
            pacientes.value = pacientes.value.filter((val) => val.id !== paciente.value.id);
            deletePacienteDialog.value = false;
            paciente.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente eliminado correctamente', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar el paciente:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el paciente', life: 4000 });
        });
}

function findIndexById(id) {
    return pacientes.value.findIndex((p) => p.id === id);
}

function exportCSV() {
    dt.value.exportCSV();
}
</script>

<template>
    <div>
        <!-- Spinner de carga global -->
        <div v-if="loading || isSaving" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <ProgressSpinner style="width: 60px; height: 60px" strokeWidth="4" animationDuration="1.5s" aria-label="Cargando..." />
        </div>
        <div class="card" :aria-busy="loading || isSaving">
            <!-- Header mejorado -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 mb-4 rounded-t-lg">
                <div class="flex items-center gap-3">
                    <i class="pi pi-users text-2xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white m-0">Pacientes</h2>
                </div>
                <div class="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                    <div class="flex gap-2 w-full md:w-auto">
                        <Tooltip target=".btn-nuevo" />
                        <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="btn-nuevo font-semibold px-4 py-2" @click="openNew" aria-label="Agregar nuevo paciente" v-tooltip.top="'Agregar nuevo paciente'" />
                        <Tooltip target=".btn-exportar" />
                        <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="btn-exportar font-semibold px-4 py-2" @click="exportCSV($event)" aria-label="Exportar pacientes" v-tooltip.top="'Exportar pacientes a CSV'" />
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
                <Column :exportable="false" style="min-width: 12rem" class="text-primary-600 dark:text-primary-400 font-bold">
                    <template #body="slotProps">
                        <Tooltip target=".btn-editar" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2 btn-editar" @click="editPaciente(slotProps.data)" aria-label="Editar paciente" v-tooltip.top="'Editar paciente'" />
                        <Tooltip target=".btn-eliminar" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" class="btn-eliminar" @click="confirmDeletePaciente(slotProps.data)" aria-label="Eliminar paciente" v-tooltip.top="'Eliminar paciente'" />
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
                                <Tooltip target=".btn-nuevo-m" />
                                <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="flex-1 btn-nuevo-m" @click="openNew" aria-label="Agregar nuevo paciente" v-tooltip.top="'Agregar nuevo paciente'" />
                                <Tooltip target=".btn-exportar-m" />
                                <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="flex-1 btn-exportar-m" @click="exportCSV($event)" aria-label="Exportar pacientes" v-tooltip.top="'Exportar pacientes a CSV'" />
                            </div>
                            <div class="flex gap-2">
                                <div class="relative flex-1">
                                    <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" aria-label="Buscar pacientes" />
                                </div>
                                <Button
                                    :icon="sortOrder === 'asc' ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-up'"
                                    severity="secondary"
                                    @click="toggleSort"
                                    class="p-2"
                                    aria-label="Ordenar alfabéticamente"
                                    v-tooltip.top="'Ordenar alfabéticamente'"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Lista de pacientes en tarjetas -->
                    <div class="flex flex-col gap-4 w-full">
                        <div
                            v-for="paciente in filteredPacientes"
                            :key="paciente.id"
                            class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            @click="editPaciente(paciente)"
                            tabindex="0"
                            aria-label="Editar paciente {{ paciente.nombre }} {{ paciente.apellido }}"
                        >
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="text-lg font-semibold dark:text-white">{{ paciente.nombre }} {{ paciente.apellido }}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">ID: {{ paciente.identificacion }}</p>
                                </div>
                                <div class="flex gap-2">
                                    <Tooltip target=".btn-eliminar-m" />
                                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2 btn-eliminar-m" @click.stop="confirmDeletePaciente(paciente)" aria-label="Eliminar paciente" v-tooltip.top="'Eliminar paciente'" />
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

        <!-- Diálogo de formulario -->
        <Dialog v-model:visible="pacienteDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Detalles del Paciente" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="identificacion" class="block font-bold mb-2">Identificación</label>
                        <InputText id="identificacion" v-model.trim="paciente.identificacion" required="true" autofocus :invalid="submitted && !paciente.identificacion" class="w-full" aria-required="true" aria-label="Identificación" />
                        <small v-if="submitted && !paciente.identificacion" class="text-red-500">La identificación es requerida.</small>
                    </div>
                    <div class="field">
                        <label for="nombre" class="block font-bold mb-2">Nombre</label>
                        <InputText id="nombre" v-model.trim="paciente.nombre" required="true" :invalid="submitted && !paciente.nombre" class="w-full" aria-required="true" aria-label="Nombre" />
                        <small v-if="submitted && !paciente.nombre" class="text-red-500">El nombre es requerido.</small>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="apellido" class="block font-bold mb-2">Apellido</label>
                        <InputText id="apellido" v-model.trim="paciente.apellido" required="true" :invalid="submitted && !paciente.apellido" class="w-full" aria-required="true" aria-label="Apellido" />
                        <small v-if="submitted && !paciente.apellido" class="text-red-500">El apellido es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="email" class="block font-bold mb-2">Email</label>
                        <InputText id="email" v-model.trim="paciente.email" required="true" class="w-full" aria-label="Email" />
                    </div>
                </div>

                <div class="field">
                    <label for="direccion" class="block font-bold mb-2">Dirección</label>
                    <InputText id="direccion" v-model.trim="paciente.direccion" required="true" :invalid="submitted && !paciente.direccion" class="w-full" aria-required="true" aria-label="Dirección" />
                    <small v-if="submitted && !paciente.direccion" class="text-red-500">La dirección es requerida.</small>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="telefono" class="block font-bold mb-2">Teléfono</label>
                        <InputText id="telefono" v-model.trim="paciente.telefono" class="w-full" aria-label="Teléfono" />
                    </div>
                    <div class="field">
                        <label for="genero" class="block font-bold mb-2">Género</label>
                        <Select id="genero" v-model="paciente.genero" :options="['M', 'F']" placeholder="Seleccione un tipo" required="true" :invalid="submitted && !paciente.genero" class="w-full" aria-required="true" aria-label="Género" />
                        <small v-if="submitted && !paciente.genero" class="text-red-500">El género es requerido.</small>
                    </div>
                </div>

                <div class="field">
                    <label for="fechaNacimiento" class="block font-bold mb-2">Fecha de Nacimiento</label>
                    <DatePicker id="fechaNacimiento" v-model="paciente.fechaNacimiento" dateFormat="dd/mm/yy" :showIcon="true" class="w-full" aria-label="Fecha de nacimiento" />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" aria-label="Cancelar" />
                    <Button label="Guardar" icon="pi pi-check" @click="savePaciente" :loading="isSaving" aria-label="Guardar paciente" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deletePacienteDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="paciente"
                    >¿Estás seguro de querer eliminar este paciente <b>{{ paciente.nombre }} {{ paciente.apellido }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deletePacienteDialog = false" aria-label="Cancelar eliminación" />
                <Button label="Sí" icon="pi pi-check" @click="deletePaciente" :loading="isSaving" aria-label="Confirmar eliminación" />
            </template>
        </Dialog>
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

/* Spinner de carga */
:deep(.p-progress-spinner-circle) {
    stroke: #2563eb;
}

/* Mejorar inputs y selects */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar) {
    border-radius: 8px;
    border: 1px solid #d1d5db;
    transition: border 0.2s;
}
:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus),
:deep(.p-calendar:focus) {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #93c5fd44;
}

/* Mejorar los diálogos */
:deep(.p-dialog) {
    border-radius: 16px;
    box-shadow: 0 4px 32px 0 rgba(59, 130, 246, 0.12);
}
:deep(.p-dialog .p-dialog-header) {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
}
:deep(.p-dialog .p-dialog-footer) {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
}

/* Mejorar los mensajes de error */
.text-red-500 {
    font-size: 0.95em;
    font-weight: 500;
    margin-top: 2px;
}
</style>
