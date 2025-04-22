<script setup>
import { PacienteService } from '@/service/PacienteService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

onMounted(() => {
    PacienteService.getAll()
        .then((data) => (pacientes.value = data))
        .catch((error) => {
            console.error('Error al cargar los pacientes:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
});

const toast = useToast();
const dt = ref();
const pacientes = ref();
const loading = ref(true);
const pacienteDialog = ref(false);
const deletePacienteDialog = ref(false);
const paciente = ref({});
const sortOrder = ref('asc');
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

// Añadir función de filtrado y ordenamiento
const filteredPacientes = computed(() => {
    if (!pacientes.value) return [];

    let result = [...pacientes.value];

    // Aplicar filtro
    if (filters.value.global.value) {
        const searchTerm = filters.value.global.value.toLowerCase();
        result = result.filter(
            (paciente) =>
                paciente.nombre?.toLowerCase().includes(searchTerm) ||
                paciente.apellido?.toLowerCase().includes(searchTerm) ||
                paciente.identificacion?.toLowerCase().includes(searchTerm) ||
                paciente.email?.toLowerCase().includes(searchTerm) ||
                paciente.telefono?.toLowerCase().includes(searchTerm) ||
                paciente.direccion?.toLowerCase().includes(searchTerm)
        );
    }

    // Aplicar ordenamiento
    result.sort((a, b) => {
        const nombreA = (a.nombre + ' ' + a.apellido).toLowerCase();
        const nombreB = (b.nombre + ' ' + b.apellido).toLowerCase();
        return sortOrder.value === 'asc' ? nombreA.localeCompare(nombreB) : nombreB.localeCompare(nombreA);
    });

    return result;
});

// Función para cambiar el orden
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

    if (paciente?.value.nombre?.trim()) {
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
            createpaciente(pacienteData);
        }
    }
}

function createpaciente(pacienteData) {
    PacienteService.create(pacienteData)
        .then((response) => {
            pacientes.value.push(response);
            pacienteDialog.value = false;
            paciente.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente Creado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al crear el paciente:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el paciente', life: 3000 });
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
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente Actualizado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al actualizar el paciente:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el paciente', life: 3000 });
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
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente Eliminado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar el paciente:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el paciente', life: 3000 });
        });
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < pacientes.value.length; i++) {
        if (pacientes.value[i].id === id) {
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
                :value="pacientes"
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
                <template #header>
                    <div class="flex flex-col gap-y-4">
                        <div class="flex flex-wrap gap-2 items-center justify-start">
                            <h4 class="m-0">Pacientes</h4>
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
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </div>
                </template>

                <Column field="identificacion" sortable style="min-width: 5rem">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">Identificación</span>
                    </template>
                </Column>
                <Column field="nombreCompleto" sortable style="min-width: 5rem">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">NombreCompleto</span>
                    </template>
                </Column>
                <Column field="genero" sortable style="min-width: 5rem">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">Genero</span>
                    </template>
                </Column>
                <Column field="email" sortable style="min-width: 16rem">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">Email</span>
                    </template>
                </Column>
                <Column field="telefono" sortable style="min-width: 12rem">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">Teléfono</span>
                    </template>
                </Column>
                <Column field="direccion" sortable style="min-width: 12rem">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">Direccion</span>
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem" class="text-primary-600 dark:text-primary-400 font-bold">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editPaciente(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletePaciente(slotProps.data)" />
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
                                <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="flex-1" @click="openNew" />
                                <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="flex-1" @click="exportCSV($event)" />
                            </div>
                            <div class="flex gap-2">
                                <div class="relative flex-1">
                                    <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" />
                                </div>
                                <Button :icon="sortOrder === 'asc' ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-up'" severity="secondary" @click="toggleSort" class="p-2" />
                            </div>
                        </div>
                    </div>

                    <!-- Lista de pacientes en tarjetas -->
                    <div class="flex flex-col gap-4 w-full">
                        <div v-for="paciente in filteredPacientes" :key="paciente.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="text-lg font-semibold dark:text-white">{{ paciente.nombre }} {{ paciente.apellido }}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">ID: {{ paciente.identificacion }}</p>
                                </div>
                                <div class="flex gap-2">
                                    <Button icon="pi pi-pencil" outlined rounded class="p-2" @click="editPaciente(paciente)" />
                                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2" @click="confirmDeletePaciente(paciente)" />
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
                                    <p class="text-gray-600 dark:text-gray-400">{{ paciente.genero }}</p>
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

        <Dialog v-model:visible="pacienteDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Detalles del Paciente" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="identificacion" class="block font-bold mb-2">Identificación</label>
                        <InputText id="identificacion" v-model.trim="paciente.identificacion" required="true" autofocus :invalid="submitted && !paciente.identificacion" class="w-full" />
                        <small v-if="submitted && !paciente.identificacion" class="text-red-500">La identificación es requerida.</small>
                    </div>
                    <div class="field">
                        <label for="nombre" class="block font-bold mb-2">Nombre</label>
                        <InputText id="nombre" v-model.trim="paciente.nombre" required="true" :invalid="submitted && !paciente.nombre" class="w-full" />
                        <small v-if="submitted && !paciente.nombre" class="text-red-500">El nombre es requerido.</small>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="apellido" class="block font-bold mb-2">Apellido</label>
                        <InputText id="apellido" v-model.trim="paciente.apellido" required="true" :invalid="submitted && !paciente.apellido" class="w-full" />
                        <small v-if="submitted && !paciente.apellido" class="text-red-500">El apellido es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="email" class="block font-bold mb-2">Email</label>
                        <InputText id="email" v-model.trim="paciente.email" required="true" :invalid="submitted && !paciente.email" class="w-full" />
                        <small v-if="submitted && !paciente.email" class="text-red-500">El email es requerido.</small>
                    </div>
                </div>

                <div class="field">
                    <label for="direccion" class="block font-bold mb-2">Dirección</label>
                    <InputText id="direccion" v-model.trim="paciente.direccion" required="true" :invalid="submitted && !paciente.direccion" class="w-full" />
                    <small v-if="submitted && !paciente.direccion" class="text-red-500">La dirección es requerida.</small>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="telefono" class="block font-bold mb-2">Teléfono</label>
                        <InputText id="telefono" v-model.trim="paciente.telefono" required="true" :invalid="submitted && !paciente.telefono" class="w-full" />
                        <small v-if="submitted && !paciente.telefono" class="text-red-500">El teléfono es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="genero" class="block font-bold mb-2">Género</label>
                        <Select id="genero" v-model="paciente.genero" :options="['M', 'F']" placeholder="Seleccione un tipo" class="w-full" />
                        <small v-if="submitted && !paciente.genero" class="text-red-500">El género es requerido.</small>
                    </div>
                </div>

                <div class="field">
                    <label for="fechaNacimiento" class="block font-bold mb-2">Fecha de Nacimiento</label>
                    <DatePicker id="fechaNacimiento" v-model="paciente.fechaNacimiento" dateFormat="dd/mm/yy" :showIcon="true" required="true" :invalid="submitted && !paciente.fechaNacimiento" class="w-full" />
                    <small v-if="submitted && !paciente.fechaNacimiento" class="text-red-500">La fecha de nacimiento es requerida.</small>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                    <Button label="Guardar" icon="pi pi-check" @click="savePaciente" />
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
                <Button label="No" icon="pi pi-times" text @click="deletePacienteDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deletePaciente" />
            </template>
        </Dialog>
    </div>
</template>
