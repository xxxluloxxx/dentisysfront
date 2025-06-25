<script setup>
import { MedicoService } from '@/service/MedicoService';
import { UsuarioService } from '@/service/UsuarioService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

onMounted(() => {
    loading.value = true;
    MedicoService.getAll()
        .then((data) => (medicos.value = data))
        .catch((error) => {
            console.error('Error al cargar los medicos:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
});

const toast = useToast();
const dt = ref();
const medicos = ref();
const medicoDialog = ref(false);
const deletemedicoDialog = ref(false);
const medico = ref({});
const loading = ref(true);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const multiple = ref('multiple');
const submitted = ref(false);
const sortAsc = ref(true);
const hasChanges = ref(false);
const originalMedico = ref({});

// Añadir función de filtrado
const filteredMedicos = computed(() => {
    if (!medicos.value) return [];

    let result = [...medicos.value];

    // Aplicar filtro de búsqueda
    if (filters.value.global.value) {
        const searchTerm = filters.value.global.value.toLowerCase();
        result = result.filter(
            (medico) =>
                medico.nombre?.toLowerCase().includes(searchTerm) ||
                medico.apellido?.toLowerCase().includes(searchTerm) ||
                medico.numeroDocumento?.toLowerCase().includes(searchTerm) ||
                medico.email?.toLowerCase().includes(searchTerm) ||
                medico.telefono?.toLowerCase().includes(searchTerm) ||
                medico.especialidad?.toLowerCase().includes(searchTerm)
        );
    }

    // Aplicar ordenamiento
    return result.sort((a, b) => {
        const nombreA = (a.nombre + ' ' + a.apellido).toLowerCase();
        const nombreB = (b.nombre + ' ' + b.apellido).toLowerCase();
        return sortAsc.value ? nombreA.localeCompare(nombreB) : nombreB.localeCompare(nombreA);
    });
});

const toggleSort = () => {
    sortAsc.value = !sortAsc.value;
};

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

function savePaciente() {
    submitted.value = true;

    if (medico?.value.nombre?.trim()) {
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
}

function createMedico(pacienteData) {
    MedicoService.create(pacienteData)
        .then((response) => {
            medicos.value.push(response);
            medicoDialog.value = false;
            medico.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Medico Creado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al crear el medico:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el medico', life: 3000 });
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
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Médico Actualizado', life: 3000 });
        })
        .catch((err) => {
            console.error('Error al actualizar el médico:', err);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el médico', life: 3000 });
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
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Medico Eliminado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar el medico:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el medico', life: 3000 });
        });
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < medicos.value.length; i++) {
        if (medicos.value[i].id === id) {
            index = i;
            break;
        }
    }

    return index;
}

function exportCSV() {
    dt.value.exportCSV();
}
</script>

<template>
    <div>
        <div class="card">
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
                <template #header>
                    <div class="flex flex-col gap-y-4">
                        <div class="flex flex-wrap gap-2 items-center justify-start">
                            <h4 class="m-0">Médicos</h4>
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                            <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-end">
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </IconField>
                        </div>
                    </div>
                </template>

                <Column field="numeroDocumento" header="Identificación" sortable style="min-width: 5rem"></Column>
                <Column field="nombreCompleto" header="Nombre Completo" sortable style="min-width: 5rem"></Column>
                <Column field="especialidad" header="Especialidad" sortable style="min-width: 5rem"></Column>
                <Column field="telefono" header="Teléfono" sortable style="min-width: 5rem"></Column>
                <Column field="email" header="Email" sortable style="min-width: 16rem"></Column>
                <Column :exportable="false" header="Acciones" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editMedico(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteMedico(slotProps.data)" />
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
                                <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="flex-1" @click="openNew" />
                                <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="flex-1" @click="exportCSV($event)" />
                            </div>
                            <div class="flex gap-2">
                                <div class="relative flex-1">
                                    <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" />
                                </div>
                                <Button :icon="sortAsc ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-up'" severity="secondary" @click="toggleSort" class="p-2" />
                            </div>
                        </div>
                    </div>

                    <!-- Lista de médicos en tarjetas -->
                    <div class="flex flex-col gap-4 w-full">
                        <div v-for="medico in filteredMedicos" :key="medico.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" @click="editMedico(medico)">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="text-lg font-semibold dark:text-white">{{ medico.nombre }} {{ medico.apellido }}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ medico.especialidad }}</p>
                                </div>
                                <div class="flex gap-2">
                                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2" @click.stop="confirmDeleteMedico(medico)" />
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

        <Dialog v-model:visible="medicoDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Detalles del Médico" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="numeroDocumento" class="block font-bold mb-2">Número de documento</label>
                        <InputText id="numeroDocumento" v-model.trim="medico.numeroDocumento" required="true" autofocus :invalid="submitted && !medico.numeroDocumento" class="w-full" @input="checkForChanges" />
                        <small v-if="submitted && !medico.numeroDocumento" class="text-red-500">El número de documento es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="telefono" class="block font-bold mb-2">Teléfono</label>
                        <InputText id="telefono" v-model.trim="medico.telefono" required="true" :invalid="submitted && !medico.telefono" class="w-full" @input="checkForChanges" />
                        <small v-if="submitted && !medico.telefono" class="text-red-500">El teléfono es requerido.</small>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="nombre" class="block font-bold mb-2">Nombre</label>
                        <InputText id="nombre" v-model.trim="medico.nombre" required="true" :invalid="submitted && !medico.nombre" class="w-full" @input="checkForChanges" />
                        <small v-if="submitted && !medico.nombre" class="text-red-500">El nombre es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="apellido" class="block font-bold mb-2">Apellido</label>
                        <InputText id="apellido" v-model.trim="medico.apellido" required="true" :invalid="submitted && !medico.apellido" class="w-full" @input="checkForChanges" />
                        <small v-if="submitted && !medico.apellido" class="text-red-500">El apellido es requerido.</small>
                    </div>
                </div>

                <div class="field">
                    <label for="especialidad" class="block font-bold mb-2">Especialidad</label>
                    <InputText id="especialidad" v-model.trim="medico.especialidad" required="true" :invalid="submitted && !medico.especialidad" class="w-full" @input="checkForChanges" />
                    <small v-if="submitted && !medico.especialidad" class="text-red-500">La especialidad es requerida.</small>
                </div>

                <div class="field">
                    <label for="email" class="block font-bold mb-2">Email</label>
                    <InputText id="email" v-model.trim="medico.email" required="true" :invalid="submitted && !medico.email" class="w-full" @input="checkForChanges" />
                    <small v-if="submitted && !medico.email" class="text-red-500">El email es requerido.</small>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                    <Button label="Guardar" icon="pi pi-check" :disabled="!hasChanges" @click="savePaciente" />
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
                <Button label="No" icon="pi pi-times" text @click="deletemedicoDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteMedico" />
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
