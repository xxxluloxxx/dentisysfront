<script setup>
// Importaciones de servicios y componentes necesarios
import { FichaOdontologicaService } from '@/service/FichaMedica';
import { MedicoService } from '@/service/MedicoService';
import { PacienteService } from '@/service/PacienteService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { ImagenFichaService } from '@/service/ImagenFicha';

import Button from 'primevue/button';
import Carousel from 'primevue/carousel';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import Toast from 'primevue/toast';
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


const fileupload = ref(null);
const imagenBase64 = ref('https://primefaces.org/cdn/primevue/images/galleria/galleria10.jpg');
const imagenesFicha = ref([]);
const visible = ref(false);
const imagenSeleccionada = ref(null);
const isZoomed = ref(false);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const translateX = ref(0);
const translateY = ref(0);

const route = useRoute();

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
onMounted(async () => {
    try {
        // Obtener el ID de la ruta
        const fichaId = route.params.id;

        // Cargar los datos de la ficha
        const fichaData = await FichaOdontologicaService.getById(fichaId);

        // Asignar los datos a las variables reactivas
        idPaciente.value = fichaData.paciente.id;
        nombrePaciente.value = fichaData.paciente.nombre;
        apellidoPaciente.value = fichaData.paciente.apellido;
        identificacionPaciente.value = fichaData.paciente.identificacion;
        fechaNacimientoPaciente.value = fichaData.paciente.fechaNacimiento;
        generoPaciente.value = fichaData.paciente.genero;

        idMedico.value = fichaData.medico.id;
        especialidadMedico.value = fichaData.medico.especialidad;
        nombreMedico.value = fichaData.medico.nombre;
        apellidoMedico.value = fichaData.medico.apellido;

        antecedentes.value = fichaData.antecedentes;
        alergias.value = fichaData.alergias;
        medicamentosActuales.value = fichaData.medicamentos_actuales;
        observaciones.value = fichaData.observaciones;
    } catch (error) {
        console.error('Error al cargar la ficha:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar los datos de la ficha',
            life: 3000
        });
    }

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

const carouselResponsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
    }
]);

onMounted(() => {
    ImagenFichaService.getAll()
        .then((data) => {
            imagenesFicha.value = data;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Imágenes cargadas correctamente', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al cargar las imágenes:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las imágenes', life: 3000 });
        });
});

const onUpload = (event) => {
    console.log('Evento de upload recibido:', event);
    if (event.files && event.files.length > 0) {
        const file = event.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const base64 = e.target.result;
            console.log('Base64 de la imagen:', base64);
            imagenBase64.value = base64;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Imagen convertida a base64', life: 3000 });
        };

        reader.onerror = (error) => {
            console.error('Error al leer el archivo:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al procesar la imagen', life: 3000 });
        };

        reader.readAsDataURL(file);
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se seleccionó ningún archivo', life: 3000 });
    }
};

const upload = () => {
    console.log('Botón upload presionado');
    if (fileupload.value) {
        console.log('Iniciando upload...');
        fileupload.value.upload();
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor selecciona un archivo primero', life: 3000 });
    }
};

const mostrarImagen = (imagen) => {
    imagenSeleccionada.value = imagen;
    visible.value = true;
};

const toggleZoom = () => {
    isZoomed.value = !isZoomed.value;
    if (!isZoomed.value) {
        translateX.value = 0;
        translateY.value = 0;
    }
};

const startDragging = (e) => {
    if (isZoomed.value) {
        isDragging.value = true;
        startX.value = e.clientX - translateX.value;
        startY.value = e.clientY - translateY.value;
    }
};

const stopDragging = () => {
    isDragging.value = false;
};

const drag = (e) => {
    if (isDragging.value && isZoomed.value) {
        e.preventDefault();
        translateX.value = e.clientX - startX.value;
        translateY.value = e.clientY - startY.value;
    }
};

</script>

<template>
    <Fluid>
        <!-- Sección de carga de imágenes para la ficha médica -->
        <div class="flex mt-8">
            <div class="card flex flex-col gap-4 w-full">
                <div class="card">
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
                        <div class="font-semibold text-xl">Datos del médico</div>
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
                </div>
            </div>
        </div>

        <!-- Sección de carga de imágenes para la ficha médica -->
        <div class="flex mt-8">
            <div class="card flex flex-col gap-4 w-full">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Imágenes de la ficha médica</div>
                    <Carousel :value="imagenesFicha" :numVisible="3" :numScroll="3" :responsiveOptions="carouselResponsiveOptions">
                        <template #item="slotProps">
                            <div class="border border-surface-200 dark:border-surface-700 rounded m-2 p-4">
                                <div class="mb-4">
                                    <div class="relative mx-auto">
                                        <img :src="slotProps.data.imagenBase64" :alt="'Imagen de ficha'" class="w-full rounded cursor-pointer hover:opacity-80 transition-opacity" @click="mostrarImagen(slotProps.data)" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Carousel>
                </div>
            </div>
        </div>

        <div class="flex mt-8">
            <div class="card flex flex-col gap-4 w-full">
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

    <Dialog v-model:visible="visible" modal :style="{ width: '90vw', maxWidth: '800px' }" :draggable="false">
        <div class="image-container">
            <img
                v-if="imagenSeleccionada"
                :src="imagenSeleccionada.imagenBase64"
                :alt="'Imagen de ficha'"
                class="zoomable-image"
                :class="{ zoomed: isZoomed }"
                :style="{
                    transform: `scale(${isZoomed ? 2 : 1}) translate(${translateX}px, ${translateY}px)`
                }"
                @click="toggleZoom"
                @mousedown="startDragging"
                @mouseup="stopDragging"
                @mouseleave="stopDragging"
                @mousemove="drag"
            />
            <div class="zoom-controls">
                <Button icon="pi pi-search-plus" @click="toggleZoom" severity="secondary" />
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.p-dialog-content {
    padding: 0;
}

.image-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.zoomable-image {
    width: 100%;
    height: auto;
    cursor: zoom-in;
    transition: transform 0.3s ease;
    user-select: none;
}

.zoomable-image.zoomed {
    cursor: grab;
}

.zoomable-image.zoomed:active {
    cursor: grabbing;
}

.zoom-controls {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}
</style>
