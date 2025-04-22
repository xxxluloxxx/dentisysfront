<script setup>
import { CitaService } from '@/service/CitaService';
import { MedicoService } from '@/service/MedicoService';
import { PacienteService } from '@/service/PacienteService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const citas = ref();
const citaDialog = ref(false);
const deleteCitaDialog = ref(false);
const deleteCitasDialog = ref(false);
const cita = ref({});
const selectedCitas = ref();
const pacientes = ref();
const medicos = ref();
const opPaciente = ref(null);
const opMedico = ref(null);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const loading = ref(true);
const multiple = ref('multiple');
const sortOrder = ref(-1);
const activeTab = ref('2'); // Por defecto mostrar todos

const options = [
    { label: 'Hoy', value: '0' },
    { label: 'Últimos 7 días', value: '1' },
    { label: 'Todos', value: '2' }
];

const filteredCitas = computed(() => {
    let filtered = citas.value;

    // Filtro por búsqueda global
    if (filters.value.global.value) {
        const searchTerm = filters.value.global.value.toLowerCase();
        filtered = filtered.filter(
            (cita) => cita.pacienteNombre?.toLowerCase().includes(searchTerm) || cita.medicoNombre?.toLowerCase().includes(searchTerm) || cita.estado?.toLowerCase().includes(searchTerm) || cita.observaciones?.toLowerCase().includes(searchTerm)
        );
    }

    // Filtro por fecha
    if (activeTab.value !== '2') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filtered = filtered.filter((cita) => {
            // Convertir la fecha de la cita (que viene en formato YYYY-MM-DD)
            const [year, month, day] = cita.fechaCita.split('-').map(Number);
            const citaDate = new Date(year, month - 1, day); // month - 1 porque los meses en JS son 0-11

            if (activeTab.value === '0') {
                // Hoy
                return citaDate.getFullYear() === today.getFullYear() && citaDate.getMonth() === today.getMonth() && citaDate.getDate() === today.getDate();
            } else if (activeTab.value === '1') {
                // Últimos 7 días
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                return citaDate >= sevenDaysAgo && citaDate <= today;
            }
            return true;
        });
    }

    return filtered;
});

const sortedCitas = computed(() => {
    if (!filteredCitas.value || !Array.isArray(filteredCitas.value)) return [];

    // Aplicar el mismo filtrado por fechas que en filteredCitas
    let filtered = [...filteredCitas.value];

    if (activeTab.value !== '2') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filtered = filtered.filter((cita) => {
            // Convertir la fecha de la cita (que viene en formato YYYY-MM-DD)
            const [year, month, day] = cita.fechaCita.split('-').map(Number);
            const citaDate = new Date(year, month - 1, day); // month - 1 porque los meses en JS son 0-11

            if (activeTab.value === '0') {
                // Hoy
                return citaDate.getFullYear() === today.getFullYear() && citaDate.getMonth() === today.getMonth() && citaDate.getDate() === today.getDate();
            } else if (activeTab.value === '1') {
                // Últimos 7 días
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                return citaDate >= sevenDaysAgo && citaDate <= today;
            }
            return true;
        });
    }

    // Aplicar el ordenamiento
    return filtered.sort((a, b) => {
        const fechaA = new Date(a.fechaCita + 'T' + a.horaCita);
        const fechaB = new Date(b.fechaCita + 'T' + b.horaCita);
        return (fechaB - fechaA) * sortOrder.value;
    });
});

const toggleSort = () => {
    sortOrder.value *= -1;
};

onMounted(() => {
    loading.value = true;
    CitaService.getAllCitas()
        .then((data) => (citas.value = data))
        .catch((error) => {
            console.error('Error al cargar las citas:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });

    PacienteService.getAll()
        .then((data) => (pacientes.value = data))
        .catch((error) => {
            console.error('Error al cargar los pacientes:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        });
    // Carga de médicos desde el servicio
    MedicoService.getAll()
        .then((data) => (medicos.value = data))
        .catch((error) => {
            console.error('Error al cargar los medicos:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        });
});

function openNew() {
    cita.value = {};
    submitted.value = false;
    citaDialog.value = true;
}

function hideDialog() {
    citaDialog.value = false;
    submitted.value = false;
}

function saveCita() {
    submitted.value = true;
    console.log('Datos de la cita:', cita.value);

    if (!cita.value.pacienteId || !cita.value.medicoId || !cita.value.fechaCita || !cita.value.horaCita || !cita.value.estado) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Por favor complete todos los campos requeridos',
            life: 3000
        });
        return;
    }

    const citaData = {
        paciente: {
            id: cita.value.pacienteId
        },
        medico: {
            id: cita.value.medicoId
        },
        agenda: {
            id: 1
        },
        fechaCita: new Date(cita.value.fechaCita).toISOString().split('T')[0],
        horaCita: new Date(cita.value.horaCita).toLocaleTimeString('es-EC', {
            hour12: false,
            timeZone: 'America/Guayaquil',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        estado: cita.value.estado,
        observaciones: cita.value.observaciones
    };

    console.log('Datos a enviar:', citaData);

    if (cita.value.id) {
        updateCita(citaData);
    } else {
        createCita(citaData);
    }
}

function createCita(citaData) {
    CitaService.create(citaData)
        .then(() => {
            CitaService.getAllCitas()
                .then((data) => {
                    citas.value = data;
                    citaDialog.value = false;
                    cita.value = {};
                    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Cita Creada', life: 3000 });
                })
                .catch((error) => {
                    console.error('Error al recargar las citas:', error);
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al recargar las citas', life: 3000 });
                });
        })
        .catch((error) => {
            console.error('Error al crear la cita:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear la cita', life: 3000 });
        });
}

function updateCita(citaData) {
    CitaService.update(cita.value.id, citaData)
        .then(() => {
            CitaService.getAllCitas()
                .then((data) => {
                    citas.value = data;
                    citaDialog.value = false;
                    cita.value = {};
                    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Cita Actualizada', life: 3000 });
                })
                .catch((error) => {
                    console.error('Error al recargar las citas:', error);
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al recargar las citas', life: 3000 });
                });
        })
        .catch((error) => {
            console.error('Error al actualizar la cita:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la cita', life: 3000 });
        });
}

function editCita(citaData) {
    if (citaData) {
        cita.value = { ...citaData };
        console.log('Datos de la cita:', cita.value);
        citaDialog.value = true;
    }
}

function confirmDeleteCita(cli) {
    cita.value = cli;
    deleteCitaDialog.value = true;
}

function deleteCita() {
    CitaService.delete(cita.value.id)
        .then(() => {
            citas.value = citas.value.filter((val) => val.id !== cita.value.id);
            deleteCitaDialog.value = false;
            cita.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Cita Eliminada', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar la cita:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar la cita', life: 3000 });
        });
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteCitasDialog.value = true;
}

function deleteSelectedCitas() {
    const deletePromises = selectedCitas.value.map((paciente) => CitaService.delete(paciente.id));

    Promise.all(deletePromises)
        .then(() => {
            citas.value = citas.value.filter((val) => !selectedCitas.value.includes(val));
            deleteCitasDialog.value = false;
            selectedCitas.value = null;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Pacientes Eliminados', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar los pacientes:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar las citas', life: 3000 });
        });
}

function toggleDataTablePacientes(event) {
    opPaciente.value.toggle(event);
}

function toggleDataTableMedicos(event) {
    opMedico.value.toggle(event);
}

function onPacienteSelect(event) {
    opPaciente.value.hide();
    console.log('Paciente seleccionado:', event.data);
    cita.value.pacienteNombre = event.data.nombre + ' ' + event.data.apellido;
    cita.value.pacienteId = event.data.id;
    console.log('ID del paciente guardado:', cita.value.pacienteId);
}

function onMedicoSelect(event) {
    opMedico.value.hide();
    console.log('Médico seleccionado:', event.data);
    cita.value.medicoNombre = event.data.nombre + ' ' + event.data.apellido;
    cita.value.medicoId = event.data.id;
    console.log('ID del médico guardado:', cita.value.medicoId);
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
</script>

<template>
    <div>
        <div class="card">
            <!-- Vista de escritorio -->
            <DataTable
                ref="dt"
                v-model:selection="selectedCitas"
                :value="sortedCitas"
                dataKey="id"
                :paginator="true"
                :rows="10"
                scrollable
                scrollHeight="600px"
                :sortMode="multiple"
                :multiSortMeta="[
                    { field: 'fechaCita', order: -1 },
                    { field: 'horaCita', order: -1 }
                ]"
                :filters="filters"
                :loading="loading"
                striped
                class="p-datatable-striped hidden md:block"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} citas"
            >
                <template #header>
                    <div class="flex flex-col gap-y-4">
                        <div class="flex flex-wrap gap-2 items-center justify-start">
                            <h4 class="m-0">Citas</h4>
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                            <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <SelectButton v-model="activeTab" :options="options" optionLabel="label" optionValue="value" />
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </IconField>
                        </div>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="fechaCita" sortable style="min-width: 5rem">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">Fecha Cita</span>
                    </template>
                </Column>
                <Column field="horaCita" sortable style="min-width: 5rem">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">Hora Cita</span>
                    </template>
                    <template #body="slotProps">
                        {{ slotProps.data.horaCita.substring(0, 5) }}
                    </template>
                </Column>
                <Column field="pacienteNombre" sortable style="min-width: 5rem">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">Paciente</span>
                    </template>
                </Column>
                <Column field="medicoNombre" sortable style="min-width: 5rem">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">Medico</span>
                    </template>
                </Column>
                <Column field="observaciones" sortable style="min-width: 5rem">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">Observaciones</span>
                    </template>
                </Column>
                <Column sortable style="min-width: 1rem" sortField="estado" :sortFunction="(a, b) => a.estado.localeCompare(b.estado)">
                    <template #header>
                        <span class="text-primary-600 dark:text-primary-400 font-bold">Estado</span>
                    </template>
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.estado" :severity="getEstadoSeverity(slotProps.data.estado)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editCita(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteCita(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <!-- Vista móvil -->
            <div class="md:hidden -mx-4">
                <div class="flex flex-col gap-4">
                    <!-- Header móvil con búsqueda y botones -->
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between">
                            <h4 class="m-0 text-xl font-semibold">Citas</h4>
                        </div>
                        <div class="flex flex-col gap-2">
                            <div class="flex gap-2">
                                <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="flex-1" @click="openNew" />
                                <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="flex-1" @click="exportCSV($event)" />
                                <Button :icon="sortOrder === -1 ? 'pi pi-sort-amount-down' : 'pi pi-sort-amount-up'" severity="secondary" @click="toggleSort" :tooltip="sortOrder === -1 ? 'Ordenar ascendente' : 'Ordenar descendente'" />
                            </div>
                            <SelectButton v-model="activeTab" :options="options" optionLabel="label" optionValue="value" class="w-full" />
                            <div class="relative w-full">
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" />
                            </div>
                        </div>
                    </div>

                    <!-- Lista de citas en tarjetas -->
                    <div class="flex flex-col gap-4 w-full">
                        <div v-for="cita in sortedCitas" :key="cita.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="text-lg font-semibold dark:text-white">{{ cita.pacienteNombre }}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Médico: {{ cita.medicoNombre }}</p>
                                </div>
                                <div class="flex gap-2">
                                    <Button icon="pi pi-pencil" outlined rounded class="p-2" @click="editCita(cita)" />
                                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2" @click="confirmDeleteCita(cita)" />
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span class="font-semibold dark:text-white">Fecha:</span>
                                    <p class="text-gray-600 dark:text-gray-400">{{ cita.fechaCita }}</p>
                                </div>
                                <div>
                                    <span class="font-semibold dark:text-white">Hora:</span>
                                    <p class="text-gray-600 dark:text-gray-400">{{ cita.horaCita.substring(0, 5) }}</p>
                                </div>
                                <div>
                                    <span class="font-semibold dark:text-white">Estado:</span>
                                    <Tag :value="cita.estado" :severity="getEstadoSeverity(cita.estado)" />
                                </div>
                                <div>
                                    <span class="font-semibold dark:text-white">Observaciones:</span>
                                    <p class="text-gray-600 dark:text-gray-400">{{ cita.observaciones }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="citaDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Detalles de la cita" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="pacienteNombre" class="block font-bold mb-2">Paciente</label>
                        <div class="flex items-center gap-2">
                            <InputText id="pacienteNombre" v-model.trim="cita.pacienteNombre" required="true" autofocus :invalid="submitted && !cita.pacienteNombre" class="w-full" disabled />
                            <Button icon="pi pi-search" @click="toggleDataTablePacientes" />
                        </div>
                        <small v-if="submitted && !cita.pacienteNombre" class="text-red-500">El paciente es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="medicoNombre" class="block font-bold mb-2">Médico</label>
                        <div class="flex items-center gap-2">
                            <InputText id="medicoNombre" v-model.trim="cita.medicoNombre" required="true" autofocus :invalid="submitted && !cita.medicoNombre" class="w-full" disabled />
                            <Button icon="pi pi-search" @click="toggleDataTableMedicos" />
                        </div>
                        <small v-if="submitted && !cita.medicoNombre" class="text-red-500">El médico es requerido.</small>
                    </div>
                </div>

                <div class="field">
                    <label for="observaciones" class="block font-bold mb-2">Observaciones</label>
                    <InputText id="observaciones" v-model.trim="cita.observaciones" class="w-full" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="fechaCita" class="block font-bold mb-2">Fecha</label>
                        <Calendar id="fechaCita" v-model="cita.fechaCita" dateFormat="dd/mm/yy" :showIcon="true" required="true" :invalid="submitted && !cita.fechaCita" class="w-full" />
                        <small v-if="submitted && !cita.fechaCita" class="text-red-500">La fecha de la cita es requerida.</small>
                    </div>
                    <div class="field">
                        <label for="estado" class="block font-bold mb-2">Estado</label>
                        <Select id="estado" v-model="cita.estado" :options="['PENDIENTE', 'CONFIRMADA', 'CANCELADA']" placeholder="Seleccione un estado" class="w-full" />
                        <small v-if="submitted && !cita.estado" class="text-red-500">El estado es requerido.</small>
                    </div>
                </div>

                <div class="field">
                    <label for="horaCita" class="block font-bold mb-2">Hora</label>
                    <Calendar id="horaCita" v-model="cita.horaCita" timeOnly hourFormat="24" :showIcon="true" :stepMinute="15" required="true" :invalid="submitted && !cita.horaCita" class="w-full" />
                    <small v-if="submitted && !cita.horaCita" class="text-red-500">La hora es requerida.</small>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                    <Button label="Guardar" icon="pi pi-check" @click="saveCita" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCitaDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="cita">¿Estás seguro de querer eliminar esta cita?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCitaDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteCita" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCitasDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="cita">¿Estás seguro de querer eliminar las citas seleccionadas?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCitasDialog = false" />
                <Button label="Sí" icon="pi pi-check" text @click="deleteSelectedCitas" />
            </template>
        </Dialog>

        <Popover ref="opPaciente" id="overlay_panel" style="width: 450px">
            <DataTable :value="pacientes" selectionMode="single" :paginator="true" :rows="5" @row-select="onPacienteSelect" :filters="filters">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Pacientes</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>
                <Column field="identificacion" header="Identificacion" sortable style="min-width: 12rem"></Column>
                <Column field="nombre" header="Nombre" sortable style="min-width: 12rem"></Column>
                <Column field="apellido" header="Apellido" sortable style="min-width: 12rem"></Column>
            </DataTable>
        </Popover>

        <Popover ref="opMedico" id="overlay_panel" style="width: 450px">
            <DataTable :value="medicos" selectionMode="single" :paginator="true" :rows="5" @row-select="onMedicoSelect" :filters="filters">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Médicos</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>
                <Column field="especialidad" header="Especialidad" sortable style="min-width: 12rem"></Column>
                <Column field="nombre" header="Nombre" sortable style="min-width: 12rem"></Column>
                <Column field="apellido" header="Apellido" sortable style="min-width: 12rem"></Column>
            </DataTable>
        </Popover>
    </div>
</template>
