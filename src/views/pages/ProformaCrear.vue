<script setup>
// Importaciones de servicios y componentes necesarios
import { FichaOdontologicaService } from '@/service/FichaMedica';
import { MedicoService } from '@/service/MedicoService';
import { PacienteService } from '@/service/PacienteService';
import { ProductoService } from '@/service/ProductoService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';

// Referencias para los componentes de la interfaz
const opPaciente = ref(null);
const opMedico = ref(null);
const opServicios = ref(null);
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

// Variables reactivas para los servicios
const productos = ref();
const servicios = ref([]);

// Variable reactiva para el total
const total = ref(0);

// Variable reactiva para la cantidad
const cantidad = ref(1);

// Configuración de filtros para las tablas de datos
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Función para calcular el total
const calcularTotal = () => {
    total.value = servicios.value.reduce((sum, item) => {
        return sum + item.precio * (item.cantidad || 1);
    }, 0);
};

// Observar cambios en servicios para actualizar el total
watch(
    servicios,
    () => {
        calcularTotal();
    },
    { deep: true }
);

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

    ProductoService.getAllProducts()
        .then((data) => (productos.value = data))
        .catch((error) => {
            console.error('Error al cargar los productos:', error);
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

function clickGuardar() {
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Se guardo la proforma correctamente', life: 3000 });
}

function toggleDataTableProductos(event) {
    opServicios.value.toggle(event);
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

function onProductoSelect(event) {
    opServicios.value.hide();

    // Verificar si el producto ya existe en el array de servicios
    const productoExistente = servicios.value.find((servicio) => servicio.id === event.data.id);

    if (!productoExistente) {
        const producto = { ...event.data, cantidad: 1 };
        servicios.value.push(producto);
    } else {
        toast.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Este producto ya está en la lista de servicios',
            life: 3000
        });
    }
}

function deleteServicio(servicio) {
    servicios.value = servicios.value.filter((s) => s.id !== servicio.id);
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
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <Button type="button" label="Seleccionar productos o servicios" @click="toggleDataTableProductos" />
                    <Popover ref="opServicios" id="overlay_panel" style="width: 450px" position="right">
                        <DataTable :value="productos" selectionMode="single" :paginator="true" :rows="5" @row-select="onProductoSelect" :filters="filters">
                            <template #header>
                                <div class="flex flex-wrap gap-2 items-center justify-between">
                                    <IconField>
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                                    </IconField>
                                </div>
                            </template>
                            <Column field="codigo" header="Codigo" sortable style="min-width: 12rem"></Column>
                            <Column field="nombre" header="Nombre" sortable style="min-width: 12rem"></Column>
                            <Column field="precio" header="Precio" sortable style="min-width: 12rem"></Column>
                        </DataTable>
                    </Popover>
                </div>

                <DataTable ref="dt" :value="servicios" dataKey="id" :paginator="true" :rows="10" :filters="filters">
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Servicios</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </IconField>
                        </div>
                    </template>
                    <Column field="codigo" header="Codigo" sortable style="min-width: 5rem"></Column>
                    <Column field="nombre" header="Producto" sortable style="min-width: 5rem"></Column>
                    <Column field="precio" header="Precio" sortable style="min-width: 5rem"></Column>
                    <Column header="Cantidad" style="min-width: 5rem">
                        <template #body="slotProps">
                            <InputNumber v-model="slotProps.data.cantidad" :min="1" :max="99" />
                        </template>
                    </Column>
                    <Column header="Total" style="min-width: 16rem">
                        <template #body="slotProps">
                            {{ (slotProps.data.precio * (slotProps.data.cantidad || 1)).toFixed(2) }}
                        </template>
                    </Column>
                    <Column :exportable="false" style="min-width: 12rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteServicio(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <div class="flex flex-wrap gap-4">
                    <div class="flex flex-col grow basis-0 gap-2">
                        <label for="total">Total</label>
                        <InputText id="total" v-model="total" type="text" :disabled="true" />
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <Button type="button" label="Guardar" @click="clickGuardar" />
                    </div>
                </div>
            </div>
        </div>
    </Fluid>
</template>
