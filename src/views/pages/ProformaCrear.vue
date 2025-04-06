<script setup>
// Importaciones de servicios y componentes necesarios
import { DetalleProformaService } from '@/service/DetalleProformaService';
import { MedicoService } from '@/service/MedicoService';
import { PacienteService } from '@/service/PacienteService';
import { ProductoService } from '@/service/ProductoService';
import { ProformaService } from '@/service/ProformaService';
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

// Variables reactivas para los servicios
const productos = ref();
const servicios = ref([]);

// Variable reactiva para la proforma
const subtotal = ref(0);
const iva = ref(0);
const total = ref(0);
const estado = ref('PENDIENTE');
const descripcion = ref('');

// Configuración de filtros para las tablas de datos
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Función para formatear moneda
const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
};

// Función para calcular el subtotal de un servicio
const calcularSubtotalServicio = (servicio) => {
    return servicio.precio * (servicio.cantidad || 1);
};

// Función para calcular los totales
const calcularTotales = () => {
    subtotal.value = servicios.value.reduce((sum, item) => {
        return sum + calcularSubtotalServicio(item);
    }, 0);
    iva.value = subtotal.value * 0.12; // 12% IVA
    total.value = subtotal.value + iva.value;
};

// Observar cambios en servicios para actualizar los totales
watch(
    servicios,
    () => {
        calcularTotales();
    },
    { deep: true }
);

// Función para guardar la proforma
const guardarProforma = async () => {
    // Validaciones
    if (!idPaciente.value || !idMedico.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Debe seleccionar un paciente y un médico',
            life: 3000
        });
        return;
    }

    if (servicios.value.length === 0) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Debe agregar al menos un servicio',
            life: 3000
        });
        return;
    }

    try {
        // Primero creamos la proforma
        const proformaData = {
            paciente: {
                id: idPaciente.value
            },
            medico: {
                id: idMedico.value
            },
            subtotal: subtotal.value,
            iva: 12,
            total: total.value,
            estado: estado.value,
            observaciones: descripcion.value
        };

        const proformaCreada = await ProformaService.create(proformaData);

        // Luego creamos los detalles de la proforma
        for (const servicio of servicios.value) {
            const detalleData = {
                proforma: {
                    id: proformaCreada.id
                },
                producto: {
                    id: servicio.id
                },
                cantidad: servicio.cantidad,
                precioUnitario: servicio.precio,
                subtotal: servicio.precio * servicio.cantidad
            };

            await DetalleProformaService.create(detalleData);
        }

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Proforma guardada correctamente',
            life: 3000
        });

        // Limpiar el formulario
        cancelarProforma();
    } catch (error) {
        console.error('Error al guardar la proforma:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al guardar la proforma',
            life: 3000
        });
    }
};

// Función para cancelar la creación de la proforma
const cancelarProforma = () => {
    // Limpiar todos los campos
    idPaciente.value = '';
    nombrePaciente.value = '';
    apellidoPaciente.value = '';
    identificacionPaciente.value = '';
    fechaNacimientoPaciente.value = '';
    generoPaciente.value = '';
    idMedico.value = '';
    especialidadMedico.value = '';
    nombreMedico.value = '';
    apellidoMedico.value = '';
    servicios.value = [];
    subtotal.value = 0;
    iva.value = 0;
    total.value = 0;
    estado.value = 'PENDIENTE';
    descripcion.value = '';
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
        const producto = {
            ...event.data,
            cantidad: 1,
            subtotal: event.data.precio
        };
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

// Función para actualizar la cantidad y el subtotal
function actualizarCantidad(servicio, nuevaCantidad) {
    servicio.cantidad = nuevaCantidad;
    servicio.subtotal = servicio.precio * nuevaCantidad;
    calcularTotales();
}

function deleteServicio(servicio) {
    servicios.value = servicios.value.filter((s) => s.id !== servicio.id);
}
</script>

<template>
    <Fluid>
        <div class="flex flex-col gap-4 p-2 md:p-4">

            <!-- Contenido principal -->
            <div class="grid grid-cols-1">
                <!-- Sección de datos -->
                <div class="card p-3 md:p-4">
                    <h2 class="text-lg md:text-xl font-semibold mb-3 md:mb-4">Datos</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <!-- Datos del paciente -->
                        <div class="flex flex-col gap-2 md:gap-4">
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-sm md:text-base">Paciente:</span>
                                <span class="text-sm md:text-base">{{ nombrePaciente }} {{ apellidoPaciente }}</span>
                            </div>
                            <Button type="button" label="Seleccionar Paciente" class="text-sm" @click="toggleDataTablePacientes" />
                        </div>

                        <!-- Datos del médico -->
                        <div class="flex flex-col gap-2 md:gap-4">
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-sm md:text-base">Médico:</span>
                                <span class="text-sm md:text-base">{{ nombreMedico }} {{ apellidoMedico }}</span>
                            </div>
                            <Button type="button" label="Seleccionar Médico" icon="pi pi-user-md" class="text-sm" @click="toggleDataTableMedicos" />
                        </div>
                    </div>
                </div>

                <!-- Sección de descripción -->
                <div class="card p-3 md:p-4">
                    <h2 class="text-lg md:text-xl font-semibold mb-3 md:mb-4">Descripción</h2>
                    <div class="flex flex-col gap-2">
                        <span class="p-float-label">
                            <Textarea v-model="descripcion" rows="3" class="w-full" />
                        </span>
                    </div>
                </div>

                <!-- Sección de servicios -->
                <div class="card p-3 md:p-4">
                    <div class="flex justify-between items-center mb-2">
                        <h2 class="text-lg md:text-xl font-semibold">Servicios y productos</h2>
                        <Button type="button" icon="pi pi-plus" class="!w-8 !h-8 !p-0" rounded @click="toggleDataTableProductos" />
                    </div>

                    <div class="relative">
                        <DataTable ref="dt" :value="servicios" dataKey="id" :filters="filters" class="p-datatable-sm" responsiveLayout="stack" :scrollable="true" scrollHeight="400px" breakpoint="960px" :rowHover="true" stripedRows>
                            <template #header>
                                <div class="flex flex-wrap gap-2 items-center justify-between"></div>
                            </template>
                            <Column field="nombre" header="Producto" sortable>
                                <template #body="slotProps">
                                    <div class="font-semibold">{{ slotProps.data.nombre }}</div>
                                </template>
                            </Column>
                            <Column field="precio" header="Precio" sortable>
                                <template #body="slotProps">
                                    <div class="text-primary font-semibold">{{ formatCurrency(slotProps.data.precio) }}</div>
                                </template>
                            </Column>
                            <Column header="Cantidad">
                                <template #body="slotProps">
                                    <InputNumber v-model="slotProps.data.cantidad" :min="1" :max="99" class="w-full md:w-auto" size="small" @update:modelValue="(val) => actualizarCantidad(slotProps.data, val)" />
                                </template>
                            </Column>
                            <Column header="Subtotal">
                                <template #body="slotProps">
                                    <div class="text-primary font-semibold">{{ formatCurrency(slotProps.data.subtotal) }}</div>
                                </template>
                            </Column>
                            <Column :exportable="false">
                                <template #body="slotProps">
                                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2 !w-8 !h-8" @click="deleteServicio(slotProps.data)" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>

                <!-- Sección de totales -->
                <div class="card p-3 md:p-4">
                    <h2 class="text-lg md:text-xl font-semibold mb-3 md:mb-4">Resumen</h2>
                    <div class="grid grid-cols-1 gap-3 md:gap-4">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-sm md:text-base">Subtotal:</span>
                            <span class="text-sm md:text-base">{{ formatCurrency(subtotal) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-sm md:text-base">IVA (12%):</span>
                            <span class="text-sm md:text-base">{{ formatCurrency(iva) }}</span>
                        </div>
                        <div class="flex justify-between items-center text-lg md:text-xl font-bold">
                            <span>Total:</span>
                            <span>{{ formatCurrency(total) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Popovers para selección -->
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
                    <Column field="identificacion" header="Identificación" sortable style="min-width: 12rem"></Column>
                    <Column field="nombre" header="Nombre" sortable style="min-width: 12rem">
                        <template #body="slotProps"> {{ slotProps.data.nombre }} {{ slotProps.data.apellido }} </template>
                    </Column>
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
                    <Column field="nombre" header="Nombre" sortable style="min-width: 12rem">
                        <template #body="slotProps"> {{ slotProps.data.nombre }} {{ slotProps.data.apellido }} </template>
                    </Column>
                </DataTable>
            </Popover>

            <Popover ref="opServicios" id="overlay_panel" style="width: 450px" position="right">
                <DataTable :value="productos" selectionMode="single" :paginator="true" :rows="5" @row-select="onProductoSelect" :filters="filters">
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Productos y Servicios</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </IconField>
                        </div>
                    </template>
                    <Column field="nombre" header="Nombre" sortable style="min-width: 12rem"></Column>
                    <Column field="precio" header="Precio" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.precio) }}
                        </template>
                    </Column>
                </DataTable>
            </Popover>

            <!-- Botones de acción -->
            <div class="flex justify-end gap-2 mt-4">
                <Button label="Cancelar" icon="pi pi-times" severity="danger" outlined class="text-sm" @click="cancelarProforma" />
                <Button label="Guardar" icon="pi pi-save" class="text-sm" @click="guardarProforma" />
            </div>
        </div>
    </Fluid>
</template>
@/service/ProformaService
