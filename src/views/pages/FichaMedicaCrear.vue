<script setup>
// Importaciones de servicios y componentes necesarios
import { FichaOdontologicaService } from '@/service/FichaMedica';
import { MedicoService } from '@/service/MedicoService';
import { PacienteService } from '@/service/PacienteService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// Referencias para los componentes de la interfaz
const opPaciente = ref(null);
const opMedico = ref(null);
const pacientes = ref();
const medicos = ref();
const toast = useToast();

// Variables reactivas para almacenar datos del paciente
const idPaciente = ref('');
const nombrePaciente = ref('');
const apellidoPaciente = ref('');
const identificacionPaciente = ref('');
const fechaNacimientoPaciente = ref('');
const generoPaciente = ref('');

// Variables reactivas para almacenar datos del médico
const idMedico = ref('');
const especialidadMedico = ref('');
const nombreMedico = ref('');
const apellidoMedico = ref('');

// Variables reactivas para los campos del formulario
const antecedentes = ref('');
const alergias = ref('');
const medicamentosActuales = ref('');
const observaciones = ref('');

// Configuración de filtros para las tablas de datos
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Función para guardar la ficha médica
const guardarFicha = async () => {
    // Validar que se haya seleccionado un paciente y un médico
    if (!identificacionPaciente.value || !nombreMedico.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Debe seleccionar un paciente y un médico',
            life: 3000
        });
        return;
    }

    try {
        const fichaData = {
            paciente: {
                id: idPaciente.value
            },
            medico: {
                id: idMedico.value
            },
            fechaConsulta: new Date().toISOString().split('T')[0],
            antecedentes: antecedentes.value,
            alergias: alergias.value,
            medicamentos_actuales: medicamentosActuales.value,
            observaciones: observaciones.value,
            estado: 'ACTIVA'
        };

        await FichaOdontologicaService.create(fichaData);

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Ficha médica guardada correctamente',
            life: 3000
        });

        // Limpiar el formulario después de guardar
        cancelarFicha();
    } catch (error) {
        console.error('Error al guardar la ficha médica:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al guardar la ficha médica',
            life: 3000
        });
    }
};

// Función para cancelar la creación de la ficha médica
const cancelarFicha = () => {
    // Limpiar todos los campos
    nombrePaciente.value = '';
    apellidoPaciente.value = '';
    identificacionPaciente.value = '';
    fechaNacimientoPaciente.value = '';
    generoPaciente.value = '';
    especialidadMedico.value = '';
    nombreMedico.value = '';
    apellidoMedico.value = '';
    antecedentes.value = '';
    alergias.value = '';
    medicamentosActuales.value = '';
    observaciones.value = '';
};

// Carga inicial de datos al montar el componente
onMounted(() => {
    // Carga de pacientes desde el servicio
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

// Funciones para controlar la visualización de las tablas de selección
function toggleDataTablePacientes(event) {
    opPaciente.value.toggle(event);
}

function toggleDataTableMedicos(event) {
    opMedico.value.toggle(event);
}

// Manejadores de eventos para la selección de paciente y médico
function onPacienteSelect(event) {
    opPaciente.value.hide();
    idPaciente.value = event.data.id;
    nombrePaciente.value = event.data.nombre;
    apellidoPaciente.value = event.data.apellido;
    identificacionPaciente.value = event.data.identificacion;
    fechaNacimientoPaciente.value = event.data.fechaNacimiento;
    generoPaciente.value = event.data.genero;
}

function onMedicoSelect(event) {
    opMedico.value.hide();
    idMedico.value = event.data.id;
    especialidadMedico.value = event.data.especialidad;
    nombreMedico.value = event.data.nombre;
    apellidoMedico.value = event.data.apellido;
}
</script>

<template>
    <Fluid>
        <div class="flex mt-8">
            <div class="card flex flex-col gap-4 w-full">
                <!-- Título principal de la ficha médica -->
                <div class="font-semibold text-xl">Ficha medica</div>
                <div class="card flex flex-col gap-4">
                    <!-- Sección para seleccionar paciente antes de crear la ficha médica -->
                    <div class="font-semibold text-xl">Datos del paciente</div>
                    <div class="flex flex-wrap gap-4">
                        <div class="flex flex-col grow basis-0 gap-2">
                            <label for="identificacion">Cedula</label>
                            <InputText id="identificacion" v-model="identificacionPaciente" type="text" :disabled="true" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-2">
                            <label for="nombre">Nombre</label>
                            <InputText id="nombre" v-model="nombrePaciente" type="text" :disabled="true" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-2">
                            <label for="apellido">Apellido</label>
                            <InputText id="apellido" v-model="apellidoPaciente" type="text" :disabled="true" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-2">
                            <label for="generoPaciente">Genero</label>
                            <InputText id="generoPaciente" v-model="generoPaciente" type="text" :disabled="true" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-2">
                            <label for="fechaNacimientoPaciente">Fecha Nacimiento</label>
                            <InputText id="fechaNacimientoPaciente" v-model="fechaNacimientoPaciente" type="text" :disabled="true" />
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <Button type="button" label="Pacientes" @click="toggleDataTablePacientes" />
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
                    </div>
                    <!-- Sección para seleccionar médico antes de crear la ficha médica -->
                    <div class="font-semibold text-xl">Datos del medico</div>
                    <div class="flex flex-wrap gap-4">
                        <div class="flex flex-col grow basis-0 gap-2">
                            <label for="identificacion">Especialidad</label>
                            <InputText id="identificacion" v-model="especialidadMedico" type="text" :disabled="true" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-2">
                            <label for="nombre">Nombre</label>
                            <InputText id="nombre" v-model="nombreMedico" type="text" :disabled="true" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-2">
                            <label for="apellido">Apellido</label>
                            <InputText id="apellido" v-model="apellidoMedico" type="text" :disabled="true" />
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <Button type="button" label="Medicos" @click="toggleDataTableMedicos" />
                            <Popover ref="opMedico" id="overlay_panel" style="width: 450px">
                                <DataTable :value="medicos" selectionMode="single" :paginator="true" :rows="5" @row-select="onMedicoSelect" :filters="filters">
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
                                    <Column field="especialidad" header="Especialidad" sortable style="min-width: 12rem"></Column>
                                    <Column field="nombre" header="Nombre" sortable style="min-width: 12rem"></Column>
                                    <Column field="apellido" header="Apellido" sortable style="min-width: 12rem"></Column>
                                </DataTable>
                            </Popover>
                        </div>
                    </div>
                </div>
                <!-- Sección de información médica adicional -->
                <div class="flex flex-wrap">
                    <label for="antecedentes_label">Antecedentes</label>
                    <Textarea id="antecedentes_area" rows="3" v-model="antecedentes" />
                </div>
                <div class="flex flex-wrap">
                    <label for="alergias_label">Alergias</label>
                    <Textarea id="alergias_area" rows="3" v-model="alergias" />
                </div>
                <div class="flex flex-wrap">
                    <label for="medicamentos_actuales_label">Medicamentos actuales</label>
                    <Textarea id="medicamentos_actuales_area" rows="3" v-model="medicamentosActuales" />
                </div>
                <div class="flex flex-wrap">
                    <label for="observaciones_label">Observaciones</label>
                    <Textarea id="observaciones_area" rows="3" v-model="observaciones" />
                </div>
                <div class="flex justify-end gap-2 mt-4">
                    <Button label="Cancelar" icon="pi pi-times" text @click="cancelarFicha" />
                    <Button label="Guardar" icon="pi pi-check" @click="guardarFicha" />
                </div>
            </div>
        </div>
    </Fluid>
</template>
