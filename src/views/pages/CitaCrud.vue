<script setup>
import { CitaService } from '@/service/CitaService';
import { MedicoService } from '@/service/MedicoService';
import { PacienteService } from '@/service/PacienteService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

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
const multiple = ref('multiple');

onMounted(() => {
    CitaService.getAllCitas()
        .then((data) => (citas.value = data))
        .catch((error) => {
            console.error('Error al cargar las citas:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
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

    // Validar campos requeridos
    if (!cita.value.pacienteId || !cita.value.medicoId || !cita.value.fechaCita || !cita.value.horaCita || !cita.value.estado || !cita.value.observaciones) {
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
        .then((response) => {
            citas.value.push(response);
            citaDialog.value = false;
            cita.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Cita Creada', life: 3000 });
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
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Eliminar" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedCitas || !selectedCitas.length" />
                </template>

                <template #end>
                    <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedCitas"
                :value="citas"
                dataKey="id"
                :paginator="true"
                :rows="10"
                scrollable
                scrollHeight="600px"
                :sortMode="multiple"
                :multiSortMeta="[
                    { field: 'fechaCita', order: -1 },
                    { field: 'horaCita', order: 1 }
                ]"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pacientes"
            >
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

                <Column field="fechaCita" header="Fecha Cita" sortable style="min-width: 5rem"></Column>
                <Column field="horaCita" header="Hora Cita" sortable style="min-width: 5rem"></Column>
                <Column field="pacienteNombre" header="Paciente" sortable style="min-width: 5rem"></Column>
                <Column field="medicoNombre" header="Medico" sortable style="min-width: 5rem"></Column>
                <Column field="observaciones" header="Observaciones" sortable style="min-width: 5rem"></Column>
                <Column header="Estado">
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
        </div>

        <Dialog v-model:visible="citaDialog" :style="{ width: '450px' }" header="Detalles de la cita" :modal="true">
            <div class="flex flex-col gap-6">
                <div class="flex items-center gap-2">
                    <div class="flex-1">
                        <label for="pacienteNombre" class="block font-bold mb-3">Paciente</label>
                        <InputText id="pacienteNombre" v-model.trim="cita.pacienteNombre" required="true" autofocus :invalid="submitted && !cita.pacienteNombre" fluid disabled />
                        <small v-if="submitted && !cita.pacienteNombre" class="text-red-500">El paciente es requerido.</small>
                    </div>
                    <Button icon="pi pi-search" class="mt-6" @click="toggleDataTablePacientes" />
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
                </div>
                <div class="flex items-center gap-2">
                    <div class="flex-1">
                        <label for="medicoNombre" class="block font-bold mb-3">Medico</label>
                        <InputText id="medicoNombre" v-model.trim="cita.medicoNombre" required="true" autofocus :invalid="submitted && !cita.medicoNombre" fluid disabled />
                        <small v-if="submitted && !cita.medicoNombre" class="text-red-500">El medico es requerido.</small>
                    </div>
                    <Button icon="pi pi-search" class="mt-6" @click="toggleDataTableMedicos" />
                    <Popover ref="opMedico" id="overlay_panel" style="width: 450px">
                        <DataTable :value="medicos" selectionMode="single" :paginator="true" :rows="5" @row-select="onMedicoSelect" :filters="filters">
                            <template #header>
                                <div class="flex flex-wrap gap-2 items-center justify-between">
                                    <h4 class="m-0">Medicos</h4>
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
                <div>
                    <label for="observaciones" class="block font-bold mb-3">Observaciones</label>
                    <InputText id="observaciones" v-model.trim="cita.observaciones" required="true" autofocus :invalid="submitted && !cita.observaciones" fluid />
                    <small v-if="submitted && !cita.observaciones" class="text-red-500">El observaciones es requerido.</small>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="fechaCita" class="block font-bold mb-3">Fecha</label>
                        <Calendar id="fechaCita" v-model="cita.fechaCita" dateFormat="dd/mm/yy" :showIcon="true" required="true" :invalid="submitted && !cita.fechaCita" />
                        <small v-if="submitted && !cita.fechaCita" class="text-red-500">La fecha de la cita es requerida.</small>
                    </div>
                    <div>
                        <label for="estado" class="block font-bold mb-3">Estado</label>
                        <Select id="estado" v-model="cita.estado" :options="['PENDIENTE', 'CONFIRMADA', 'CANCELADA']" placeholder="Seleccione un tipo" class="w-full" />
                        <small v-if="submitted && !cita.estado" class="text-red-500">El estado es requerido.</small>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="horaCitaInicio" class="block font-bold mb-3">Hora inicio</label>
                        <Calendar id="horaCitaInicio" v-model="cita.horaCita" timeOnly hourFormat="24" :showIcon="true" required="true" :invalid="submitted && !cita.horaCita" />
                        <small v-if="submitted && !cita.horaCita" class="text-red-500">La hora de inicio es requerida.</small>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveCita" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCitaDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="cita"
                    >¿Estás seguro de querer eliminar este paciente <b>{{ cita.nombre }} {{ cita.apellido }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCitaDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteCita" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCitasDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="cita">¿Estás seguro de querer eliminar los pacientes seleccionados?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCitasDialog = false" />
                <Button label="Sí" icon="pi pi-check" text @click="deleteSelectedCitas" />
            </template>
        </Dialog>
    </div>
</template>
