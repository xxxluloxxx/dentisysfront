<script setup>
import { MedicoService } from '@/service/MedicoService';
import { UsuarioService } from '@/service/UsuarioService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const medicos = ref([]);
const medicoDialog = ref(false);
const deletemedicoDialog = ref(false);
const medico = ref({});
const loading = ref(true);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const multiple = ref('multiple');
const submitted = ref(false);
const sortOrder = ref('asc');
const hasChanges = ref(false);
const originalMedico = ref({});
const isSaving = ref(false);

onMounted(() => {
    cargarMedicos();
});

function cargarMedicos() {
    loading.value = true;
    MedicoService.getAll()
        .then((data) => (medicos.value = data))
        .catch((error) => {
            console.error('Error al cargar los medicos:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 4000 });
        })
        .finally(() => {
            loading.value = false;
        });
}

// Filtrado y ordenamiento unificado
const filteredMedicos = computed(() => {
    if (!medicos.value) return [];
    let result = [...medicos.value];
    if (filters.value.global.value) {
        const searchTerm = filters.value.global.value.toLowerCase();
        result = result.filter(
            (m) =>
                m.nombre?.toLowerCase().includes(searchTerm) ||
                m.apellido?.toLowerCase().includes(searchTerm) ||
                m.numeroDocumento?.toLowerCase().includes(searchTerm) ||
                m.email?.toLowerCase().includes(searchTerm) ||
                m.telefono?.toLowerCase().includes(searchTerm) ||
                m.especialidad?.toLowerCase().includes(searchTerm)
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
    medico.value = {};
    originalMedico.value = {};
    submitted.value = false;
    hasChanges.value = false;
    medicoDialog.value = true;
}

function hideDialog() {
    medicoDialog.value = false;
    submitted.value = false;
    hasChanges.value = false;
    originalMedico.value = {};
}

function checkForChanges() {
    if (!medico.value || !originalMedico.value) {
        hasChanges.value = false;
        return;
    }

    const fields = ['numeroDocumento', 'nombre', 'apellido', 'email', 'telefono', 'direccion', 'especialidad'];
    hasChanges.value = fields.some((field) => {
        const currentValue = medico.value[field] || '';
        const originalValue = originalMedico.value[field] || '';
        return currentValue !== originalValue;
    });
}

function saveMedico() {
    submitted.value = true;
    if (!medico.value.numeroDocumento?.trim() || !medico.value.nombre?.trim() || !medico.value.apellido?.trim() || !medico.value.email?.trim() || !medico.value.telefono?.trim() || !medico.value.especialidad?.trim()) {
        toast.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Por favor, complete todos los campos obligatorios.', life: 3500 });
        return;
    }
    isSaving.value = true;
    const medicoDataActualizar = {
        numeroDocumento: medico.value.numeroDocumento,
        nombre: medico.value.nombre,
        apellido: medico.value.apellido,
        email: medico.value.email,
        telefono: medico.value.telefono,
        direccion: medico.value.direccion,
        especialidad: medico.value.especialidad
    };
    if (medico.value.id) {
        updateMedico(medicoDataActualizar);
    } else {
        createMedico(medicoDataActualizar);
    }
}

function createMedico(medicoData) {
    MedicoService.create(medicoData)
        .then((response) => {
            medicos.value.push(response);
            medicoDialog.value = false;
            medico.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Médico creado correctamente', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al crear el medico:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el médico', life: 4000 });
        })
        .finally(() => {
            isSaving.value = false;
        });
}

function updateMedico(medicoData) {
    MedicoService.getById(medico.value.id)
        .then((medicoCompleto) => {
            const usuarioId = medicoCompleto.usuarioId;
            if (usuarioId) {
                return UsuarioService.update(usuarioId, medicoData);
            } else {
                throw new Error('No se encontró el ID del usuario asociado al médico');
            }
        })
        .then(() => {
            return MedicoService.update(medico.value.id, medicoData);
        })
        .then((response) => {
            const index = findIndexById(medico.value.id);
            if (index !== -1) {
                medicos.value[index] = response;
            }
            medicoDialog.value = false;
            medico.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Médico actualizado correctamente', life: 3000 });
        })
        .catch((err) => {
            console.error('Error al actualizar el médico:', err);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el médico', life: 4000 });
        })
        .finally(() => {
            isSaving.value = false;
        });
}

function editMedico(cli) {
    if (cli) {
        medico.value = { ...cli };
        originalMedico.value = { ...cli };
        hasChanges.value = false;
        medicoDialog.value = true;
    }
}

function confirmDeleteMedico(cli) {
    medico.value = cli;
    deletemedicoDialog.value = true;
}

function deleteMedico() {
    MedicoService.delete(medico.value.id)
        .then(() => {
            medicos.value = medicos.value.filter((val) => val.id !== medico.value.id);
            deletemedicoDialog.value = false;
            medico.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Médico eliminado correctamente', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar el medico:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el médico', life: 4000 });
        });
}

function findIndexById(id) {
    return medicos.value.findIndex((m) => m.id === id);
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
                    <i class="pi pi-user-md text-2xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white m-0">Médicos</h2>
                </div>
                <div class="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                    <div class="flex gap-2 w-full md:w-auto">
                        <Tooltip target=".btn-nuevo" />
                        <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="btn-nuevo font-semibold px-4 py-2" @click="openNew" aria-label="Agregar nuevo médico" v-tooltip.top="'Agregar nuevo médico'" />
                        <Tooltip target=".btn-exportar" />
                        <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="btn-exportar font-semibold px-4 py-2" @click="exportCSV($event)" aria-label="Exportar médicos" v-tooltip.top="'Exportar médicos a CSV'" />
                    </div>
                    <div class="relative flex-1 md:w-64">
                        <IconField class="w-full">
                            <InputIcon>
                                <i class="pi pi-search text-blue-500" />
                            </InputIcon>
                            <InputText
                                v-model="filters['global'].value"
                                placeholder="Buscar médicos..."
                                aria-label="Buscar médicos"
                                class="w-full pl-10 py-2 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </IconField>
                    </div>
                </div>
            </div>
            <!-- Vista de escritorio -->
            <DataTable
                ref="dt"
                :value="filteredMedicos"
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
                        <Tooltip target=".btn-editar" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2 btn-editar" @click="editMedico(slotProps.data)" aria-label="Editar médico" v-tooltip.top="'Editar médico'" />
                        <Tooltip target=".btn-eliminar" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" class="btn-eliminar" @click="confirmDeleteMedico(slotProps.data)" aria-label="Eliminar médico" v-tooltip.top="'Eliminar médico'" />
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
                                <Tooltip target=".btn-nuevo-m" />
                                <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="flex-1 btn-nuevo-m" @click="openNew" aria-label="Agregar nuevo médico" v-tooltip.top="'Agregar nuevo médico'" />
                                <Tooltip target=".btn-exportar-m" />
                                <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="flex-1 btn-exportar-m" @click="exportCSV($event)" aria-label="Exportar médicos" v-tooltip.top="'Exportar médicos a CSV'" />
                            </div>
                            <div class="flex gap-2">
                                <div class="relative flex-1">
                                    <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" aria-label="Buscar médicos" />
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

                    <!-- Lista de médicos en tarjetas -->
                    <div class="flex flex-col gap-4 w-full">
                        <div
                            v-for="medico in filteredMedicos"
                            :key="medico.id"
                            class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            @click="editMedico(medico)"
                            tabindex="0"
                            aria-label="Editar médico {{ medico.nombre }} {{ medico.apellido }}"
                        >
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="text-lg font-semibold dark:text-white">{{ medico.nombre }} {{ medico.apellido }}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ medico.especialidad }}</p>
                                </div>
                                <div class="flex gap-2">
                                    <Tooltip target=".btn-eliminar-m" />
                                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2 btn-eliminar-m" @click.stop="confirmDeleteMedico(medico)" aria-label="Eliminar médico" v-tooltip.top="'Eliminar médico'" />
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

        <!-- Diálogo de formulario -->
        <Dialog v-model:visible="medicoDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Detalles del Médico" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="numeroDocumento" class="block font-bold mb-2">Número de documento</label>
                        <InputText
                            id="numeroDocumento"
                            v-model.trim="medico.numeroDocumento"
                            required="true"
                            autofocus
                            :invalid="submitted && !medico.numeroDocumento"
                            class="w-full"
                            @input="checkForChanges"
                            aria-required="true"
                            aria-label="Número de documento"
                        />
                        <small v-if="submitted && !medico.numeroDocumento" class="text-red-500">El número de documento es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="telefono" class="block font-bold mb-2">Teléfono</label>
                        <InputText id="telefono" v-model.trim="medico.telefono" required="true" :invalid="submitted && !medico.telefono" class="w-full" @input="checkForChanges" aria-required="true" aria-label="Teléfono" />
                        <small v-if="submitted && !medico.telefono" class="text-red-500">El teléfono es requerido.</small>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="nombre" class="block font-bold mb-2">Nombre</label>
                        <InputText id="nombre" v-model.trim="medico.nombre" required="true" :invalid="submitted && !medico.nombre" class="w-full" @input="checkForChanges" aria-required="true" aria-label="Nombre" />
                        <small v-if="submitted && !medico.nombre" class="text-red-500">El nombre es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="apellido" class="block font-bold mb-2">Apellido</label>
                        <InputText id="apellido" v-model.trim="medico.apellido" required="true" :invalid="submitted && !medico.apellido" class="w-full" @input="checkForChanges" aria-required="true" aria-label="Apellido" />
                        <small v-if="submitted && !medico.apellido" class="text-red-500">El apellido es requerido.</small>
                    </div>
                </div>

                <div class="field">
                    <label for="especialidad" class="block font-bold mb-2">Especialidad</label>
                    <InputText id="especialidad" v-model.trim="medico.especialidad" required="true" :invalid="submitted && !medico.especialidad" class="w-full" @input="checkForChanges" aria-required="true" aria-label="Especialidad" />
                    <small v-if="submitted && !medico.especialidad" class="text-red-500">La especialidad es requerida.</small>
                </div>

                <div class="field">
                    <label for="email" class="block font-bold mb-2">Email</label>
                    <InputText id="email" v-model.trim="medico.email" required="true" :invalid="submitted && !medico.email" class="w-full" @input="checkForChanges" aria-required="true" aria-label="Email" />
                    <small v-if="submitted && !medico.email" class="text-red-500">El email es requerido.</small>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" aria-label="Cancelar" />
                    <Button label="Guardar" icon="pi pi-check" :disabled="!hasChanges" @click="saveMedico" :loading="isSaving" aria-label="Guardar médico" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deletemedicoDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="medico"
                    >¿Estás seguro de querer eliminar este médico <b>{{ medico.nombre }} {{ medico.apellido }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deletemedicoDialog = false" aria-label="Cancelar eliminación" />
                <Button label="Sí" icon="pi pi-check" @click="deleteMedico" :loading="isSaving" aria-label="Confirmar eliminación" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.p-fluid {
    width: 100%;
}

.field {
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .p-dialog {
        width: 90vw !important;
    }
}
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

/* Spinner de carga */
:deep(.p-progress-spinner-circle) {
    stroke: #2563eb;
}

/* Mejorar inputs y selects */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputnumber) {
    border-radius: 8px;
    border: 1px solid #d1d5db;
    transition: border 0.2s;
}
:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus),
:deep(.p-calendar:focus),
:deep(.p-inputnumber:focus) {
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
