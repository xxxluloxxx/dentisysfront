<script setup>
import { FichaService } from '@/service/FichaMedica';
import { PacienteService } from '@/service/PacienteService';
import { ProcedimientoService } from '@/service/ProcedimientoService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import OdontoDiente from '@/components/OdontoDiente.vue';

const router = useRouter();

const procedimiento = ref(null);
const opPaciente = ref(null);
const pacientes = ref();
const toast = useToast();

// Variables reactivas para almacenar datos del paciente
const idPaciente = ref('');
const nombrePaciente = ref('');
const identificacionPaciente = ref('');
const fechaNacimientoPaciente = ref('');
const generoPaciente = ref('');

// Funciones para controlar la visualización de las tablas de selección
function toggleDataTablePacientes(event) {
    opPaciente.value.toggle(event);
}

// Configuración de filtros para las tablas de datos
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onMounted(() => {
    console.log('Iniciando la ficha, con el procedimiento id: ', 1);
    procedimiento.value = ProcedimientoService.getById(1);
    console.log(procedimiento.value);

    PacienteService.getAll()
        .then((data) => (pacientes.value = data))
        .catch((error) => {
            console.error('Error al cargar los pacientes:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        });
});

// Manejadores de eventos para la selección de paciente y médico
async function onPacienteSelect(event) {
    try {
        const fichasPaciente = await FichaService.getByPaciente(event.data.id);
        if (fichasPaciente === true || (fichasPaciente && fichasPaciente.length > 0)) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Este paciente ya tiene una ficha médica creada',
                life: 3000
            });
            opPaciente.value.hide();
            return;
        }
        idPaciente.value = event.data.id;
        nombrePaciente.value = event.data.nombreCompleto;
        identificacionPaciente.value = event.data.identificacion;
        fechaNacimientoPaciente.value = event.data.fechaNacimiento;
        generoPaciente.value = event.data.genero;
    } catch (error) {
        console.error('Error al verificar fichas del paciente:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al verificar las fichas del paciente',
            life: 3000
        });
    }
}

// Estado del formulario
const formData = reactive({
    motivoConsulta: '',
    problemaActual: '',
    antecedentes: [
        { nombre: 'Alergia antibiótico', check: false, descripcion: '' },
        { nombre: 'Alergia anestesia', check: false, descripcion: '' },
        { nombre: 'Hemorragias', check: false, descripcion: '' },
        { nombre: 'VIH/Sida', check: false, descripcion: '' },
        { nombre: 'Tuberculosis', check: false, descripcion: '' },
        { nombre: 'Asma', check: false, descripcion: '' },
        { nombre: 'Diabetes', check: false, descripcion: '' },
        { nombre: 'Hipertensión', check: false, descripcion: '' },
        { nombre: 'Enf. Cardíacas', check: false, descripcion: '' },
        { nombre: 'Otro', check: false, descripcion: '' }
    ],
    signosVitales: [
        { signo: 'Temperatura', valor: '' },
        { signo: 'Presión Arterial', valor: '' },
        { signo: 'Frecuencia Cardíaca', valor: '' },
        { signo: 'Frecuencia Respiratoria', valor: '' }
    ],
    examenEstomatognatico: [
        { examen: 'Labios', tiene: false, descripcion: '' },
        { examen: 'Mejillas', tiene: false, descripcion: '' },
        { examen: 'Maxilar superior', tiene: false, descripcion: '' },
        { examen: 'Maxilar inferior', tiene: false, descripcion: '' },
        { examen: 'Lengua', tiene: false, descripcion: '' },
        { examen: 'Paladar', tiene: false, descripcion: '' },
        { examen: 'Piso', tiene: false, descripcion: '' },
        { examen: 'Carrillos', tiene: false, descripcion: '' },
        { examen: 'Glándulas salivales', tiene: false, descripcion: '' },
        { examen: 'Oro faringe', tiene: false, descripcion: '' },
        { examen: 'A.T.M', tiene: false, descripcion: '' },
        { examen: 'Ganglios', tiene: false, descripcion: '' }
    ],
    odontograma: {
        superiorDerecho: [
            { diente: '1.8', descripcion: '' },
            { diente: '1.7', descripcion: '' },
            { diente: '1.6', descripcion: '' },
            { diente: '1.5', descripcion: '' },
            { diente: '1.4', descripcion: '' },
            { diente: '1.3', descripcion: '' },
            { diente: '1.2', descripcion: '' },
            { diente: '1.1', descripcion: '' }
        ],
        superiorIzquierdo: [
            { diente: '2.8', descripcion: '' },
            { diente: '2.7', descripcion: '' },
            { diente: '2.6', descripcion: '' },
            { diente: '2.5', descripcion: '' },
            { diente: '2.4', descripcion: '' },
            { diente: '2.3', descripcion: '' },
            { diente: '2.2', descripcion: '' },
            { diente: '2.1', descripcion: '' }
        ],
        inferiorDerecho: [
            { diente: '4.8', descripcion: '' },
            { diente: '4.7', descripcion: '' },
            { diente: '4.6', descripcion: '' },
            { diente: '4.5', descripcion: '' },
            { diente: '4.4', descripcion: '' },
            { diente: '4.3', descripcion: '' },
            { diente: '4.2', descripcion: '' },
            { diente: '4.1', descripcion: '' }
        ],
        inferiorIzquierdo: [
            { diente: '3.8', descripcion: '' },
            { diente: '3.7', descripcion: '' },
            { diente: '3.6', descripcion: '' },
            { diente: '3.5', descripcion: '' },
            { diente: '3.4', descripcion: '' },
            { diente: '3.3', descripcion: '' },
            { diente: '3.2', descripcion: '' },
            { diente: '3.1', descripcion: '' }
        ]
    },
    higieneOral: [
        { p1: '16', check1: false, p2: '17', check2: false, p3: '55', check3: false, placa: '', calculo: '', gingivitis: '' },
        { p1: '11', check1: false, p2: '21', check2: false, p3: '51', check3: false, placa: '', calculo: '', gingivitis: '' },
        { p1: '26', check1: false, p2: '27', check2: false, p3: '65', check3: false, placa: '', calculo: '', gingivitis: '' },
        { p1: '36', check1: false, p2: '37', check2: false, p3: '75', check3: false, placa: '', calculo: '', gingivitis: '' },
        { p1: '31', check1: false, p2: '41', check2: false, p3: '71', check3: false, placa: '', calculo: '', gingivitis: '' },
        { p1: '46', check1: false, p2: '47', check2: false, p3: '85', check3: false, placa: '', calculo: '', gingivitis: '' }
    ],
    totales: {
        placa: 0,
        calculo: 0,
        gingivitis: 0
    }
});

// Métodos computados para los totales
const totales = computed({
    get: () => formData.totales,
    set: (newValue) => {
        formData.totales = newValue;
    }
});

// Método para actualizar totales
const actualizarTotales = () => {
    formData.totales = {
        placa: formData.higieneOral.reduce((sum, item) => sum + (Number(item.placa) || 0), 0),
        calculo: formData.higieneOral.reduce((sum, item) => sum + (Number(item.calculo) || 0), 0),
        gingivitis: formData.higieneOral.reduce((sum, item) => sum + (Number(item.gingivitis) || 0), 0)
    };
};

// Observar cambios en higieneOral para actualizar totales
watch(
    () => formData.higieneOral,
    () => {
        actualizarTotales();
    },
    { deep: true }
);

// Métodos
const toggleAntecedentes = () => {
    formData.antecedentes.forEach((antecedente) => {
        antecedente.check = false;
        antecedente.descripcion = '';
    });
};

const toggleExamenEstomatognatico = () => {
    formData.examenEstomatognatico.forEach((examen) => {
        examen.tiene = false;
        examen.descripcion = '';
    });
};

const guardarFicha = async () => {
    // Crear objeto con los datos formateados
    const fichaData = {
        paciente: {
            id: idPaciente.value
        },
        medico: {
            id: JSON.parse(localStorage.getItem('userData'))?.id
        },
        datos: {
            datosFicha: {
                motivoConsulta: formData.motivoConsulta,
                descripcion: formData.problemaActual
            },
            antecedentes: formData.antecedentes.map((antecedente) => ({
                nombre: antecedente.nombre,
                descripcion: antecedente.descripcion,
                check: antecedente.check
            })),
            signosVitales: formData.signosVitales.map((signo) => ({
                nombre: signo.signo,
                valor: signo.valor
            })),
            examenEstomatognatico: formData.examenEstomatognatico.map((examen) => ({
                nombre: examen.examen,
                descripcion: examen.descripcion,
                tiene: examen.tiene
            })),
            odontograma: {
                superiorDerecho: formData.odontograma.superiorDerecho
                    .filter((diente) => diente.descripcion)
                    .map((diente) => ({
                        diente: diente.diente,
                        descripcion: diente.descripcion
                    })),
                superiorIzquierdo: formData.odontograma.superiorIzquierdo
                    .filter((diente) => diente.descripcion)
                    .map((diente) => ({
                        diente: diente.diente,
                        descripcion: diente.descripcion
                    })),
                inferiorDerecho: formData.odontograma.inferiorDerecho
                    .filter((diente) => diente.descripcion)
                    .map((diente) => ({
                        diente: diente.diente,
                        descripcion: diente.descripcion
                    })),
                inferiorIzquierdo: formData.odontograma.inferiorIzquierdo
                    .filter((diente) => diente.descripcion)
                    .map((diente) => ({
                        diente: diente.diente,
                        descripcion: diente.descripcion
                    }))
            },
            higieneOral: formData.higieneOral.map((item, index) => ({
                sextante: index + 1,
                puntos: {
                    p1: { valor: item.p1, marcado: item.check1 },
                    p2: { valor: item.p2, marcado: item.check2 },
                    p3: { valor: item.p3, marcado: item.check3 }
                },
                placa: item.placa,
                calculo: item.calculo,
                gingivitis: item.gingivitis
            })),
            totales: formData.totales
        }
    };

    try {
        await FichaService.create(fichaData);
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Ficha médica guardada correctamente',
            life: 3000
        });
        router.push('/pages/fichasMedicas');
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

const cancelar = () => {
    router.push('/pages/fichasMedicas');
};

function handleCuadranteClick(posicion, numero, { cuadrante }) {
    // Aquí puedes manejar la lógica al hacer click en un cuadrante de un diente
    console.log(`Diente ${numero} (${posicion}), cuadrante ${cuadrante}`);
}
</script>
<template>
    <Fluid>
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <h5>Crear Nueva Ficha</h5>
                    <div class="grid">
                        <div class="font-semibold text-xl mb-4">Datos del paciente</div>
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
                                <label for="generoPaciente">Genero</label>
                                <InputText id="generoPaciente" v-model="generoPaciente" type="text" :disabled="true" />
                            </div>
                            <div class="flex flex-col grow basis-0 gap-2">
                                <label for="fechaNacimientoPaciente">Fecha Nacimiento</label>
                                <InputText id="fechaNacimientoPaciente" v-model="fechaNacimientoPaciente" type="text" :disabled="true" />
                            </div>
                            <div class="flex flex-col grow basis-0 gap-2">
                                <label>&nbsp;</label>
                                <div class="flex gap-2">
                                    <Button type="button" label="Pacientes" icon="pi pi-search" @click="toggleDataTablePacientes" class="w-full" />
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
                                            <Column field="nombreCompleto" header="Nombre" sortable style="min-width: 12rem"></Column>
                                        </DataTable>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div class="card">
                                <div class="field mb-4">
                                    <label for="motivoConsulta" class="font-bold block mb-2">Motivo de la consulta</label>
                                    <InputText id="motivoConsulta" v-model="formData.motivoConsulta" class="w-full" />
                                </div>
                                <div class="field mb-4">
                                    <label for="problemaActual" class="font-bold block mb-2">Enfermedad o problema actual</label>
                                    <Textarea id="problemaActual" v-model="formData.problemaActual" rows="3" class="w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <!-- Tabla de Antecedentes -->
                    <div class="col-12">
                        <div class="card">
                            <h5>Antecedentes personales y familiares</h5>
                            <div class="field-checkbox mb-4">
                                <InputSwitch v-model="formData.sinAntecedentes" @change="toggleAntecedentes" />
                                <label class="ml-2">No tiene antecedentes</label>
                            </div>
                            <DataTable :value="formData.antecedentes" class="p-datatable-sm" stripedRows rowHover>
                                <Column field="nombre" header="Antecedente" style="width: 10%"></Column>
                                <Column field="check" header="Sí/No" style="width: 5%">
                                    <template #body="slotProps">
                                        <Checkbox v-model="slotProps.data.check" :binary="true" />
                                    </template>
                                </Column>
                                <Column field="descripcion" header="Descripción" style="width: 85%">
                                    <template #body="slotProps">
                                        <InputText v-model="slotProps.data.descripcion" class="w-full" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <!-- Tabla de Signos Vitales -->
                    <div class="col-12">
                        <div class="card">
                            <h5>Signos Vitales</h5>
                            <DataTable :value="formData.signosVitales" class="p-datatable-sm" stripedRows rowHover>
                                <Column field="signo" header="Signo Vital" style="width: 20%"></Column>
                                <Column field="valor" header="Valor" style="width: 80%">
                                    <template #body="slotProps">
                                        <InputText v-model="slotProps.data.valor" class="w-full" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <!-- Tabla de Examen del Sistema Estomatognático -->
                    <div class="col-12">
                        <div class="card">
                            <h5>Examen del Sistema Estomatognático</h5>
                            <div class="field-checkbox mb-4">
                                <InputSwitch v-model="formData.sinExamenEstomatognatico" @change="toggleExamenEstomatognatico" />
                                <label class="ml-2">No tiene hallazgos</label>
                            </div>
                            <DataTable :value="formData.examenEstomatognatico" class="p-datatable-sm" stripedRows rowHover>
                                <Column field="examen" header="Examen" style="width: 10%"></Column>
                                <Column field="tiene" header="Sí/No" style="width: 5%">
                                    <template #body="slotProps">
                                        <Checkbox v-model="slotProps.data.tiene" :binary="true" />
                                    </template>
                                </Column>
                                <Column field="descripcion" header="Descripción" style="width: 85%">
                                    <template #body="slotProps">
                                        <InputText v-model="slotProps.data.descripcion" class="w-full" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h5>Odontograma</h5>
                    <div class="mb-4">
                        <h6>Superior Derecho</h6>
                        <DataTable :value="formData.odontograma.superiorDerecho" class="p-datatable-sm" stripedRows rowHover>
                            <Column field="diente" header="Diente" style="width: 20%"></Column>
                            <Column field="descripcion" header="Descripción" style="width: 80%">
                                <template #body="slotProps">
                                    <InputText v-model="slotProps.data.descripcion" class="w-full" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>

                    <div class="mb-4">
                        <h6>Superior Izquierdo</h6>
                        <DataTable :value="formData.odontograma.superiorIzquierdo" class="p-datatable-sm" stripedRows rowHover>
                            <Column field="diente" header="Diente" style="width: 20%"></Column>
                            <Column field="descripcion" header="Descripción" style="width: 80%">
                                <template #body="slotProps">
                                    <InputText v-model="slotProps.data.descripcion" class="w-full" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>

                    <div class="mb-4">
                        <h6>Inferior Derecho</h6>
                        <DataTable :value="formData.odontograma.inferiorDerecho" class="p-datatable-sm" stripedRows rowHover>
                            <Column field="diente" header="Diente" style="width: 20%"></Column>
                            <Column field="descripcion" header="Descripción" style="width: 80%">
                                <template #body="slotProps">
                                    <InputText v-model="slotProps.data.descripcion" class="w-full" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>

                    <div class="mb-4">
                        <h6>Inferior Izquierdo</h6>
                        <DataTable :value="formData.odontograma.inferiorIzquierdo" class="p-datatable-sm" stripedRows rowHover>
                            <Column field="diente" header="Diente" style="width: 20%"></Column>
                            <Column field="descripcion" header="Descripción" style="width: 80%">
                                <template #body="slotProps">
                                    <InputText v-model="slotProps.data.descripcion" class="w-full" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>

                <div class="card">
                    <!-- Tabla de Examen del Sistema Estomatognático -->
                    <div class="col-12">
                        <div class="card">
                            <h5>Higiene oral simplificada</h5>
                            <DataTable :value="formData.higieneOral" class="p-datatable-sm" stripedRows rowHover>
                                <Column field="p1" header="P1" style="width: 5%">
                                    <template #body="slotProps">
                                        <span>{{ slotProps.data.p1 }}</span>
                                    </template>
                                </Column>
                                <Column field="check1" header="" style="width: 4%">
                                    <template #body="slotProps">
                                        <Checkbox v-model="slotProps.data.check1" :binary="true" />
                                    </template>
                                </Column>
                                <Column field="p2" header="P2" style="width: 5%">
                                    <template #body="slotProps">
                                        <span>{{ slotProps.data.p2 }}</span>
                                    </template>
                                </Column>
                                <Column field="check2" header="" style="width: 4%">
                                    <template #body="slotProps">
                                        <Checkbox v-model="slotProps.data.check2" :binary="true" />
                                    </template>
                                </Column>
                                <Column field="p3" header="P3" style="width: 5%">
                                    <template #body="slotProps">
                                        <span>{{ slotProps.data.p3 }}</span>
                                    </template>
                                </Column>
                                <Column field="check3" header="" style="width: 4%">
                                    <template #body="slotProps">
                                        <Checkbox v-model="slotProps.data.check3" :binary="true" />
                                    </template>
                                </Column>
                                <Column field="placa" header="Placa (0 - 1 - 2 - 3)" style="width: 24%">
                                    <template #body="slotProps">
                                        <InputNumber v-model="slotProps.data.placa" class="w-full" :min="0" :max="100" />
                                    </template>
                                </Column>
                                <Column field="calculo" header="Calculo (0 - 1 - 2 - 3)" style="width: 24%">
                                    <template #body="slotProps">
                                        <InputNumber v-model="slotProps.data.calculo" class="w-full" :min="0" :max="100" />
                                    </template>
                                </Column>
                                <Column field="gingivitis" header="Gingivitis (0 - 1)" style="width: 24%">
                                    <template #body="slotProps">
                                        <InputNumber v-model="slotProps.data.gingivitis" class="w-full" :min="0" :max="100" />
                                    </template>
                                </Column>
                            </DataTable>
                            <div class="mt-4 p-4 surface-ground border-round">
                                <h6 class="mb-3">Totales</h6>
                                <div class="flex align-items-center justify-content-between gap-3">
                                    <div class="flex-1">
                                        <div class="p-3 surface-card border-round shadow-2">
                                            <div class="text-500 mb-2">Total Placa</div>
                                            <div class="text-2xl font-bold text-primary">{{ totales.placa }}</div>
                                        </div>
                                    </div>
                                    <div class="flex-1">
                                        <div class="p-3 surface-card border-round shadow-2">
                                            <div class="text-500 mb-2">Total Cálculo</div>
                                            <div class="text-2xl font-bold text-primary">{{ totales.calculo }}</div>
                                        </div>
                                    </div>
                                    <div class="flex-1">
                                        <div class="p-3 surface-card border-round shadow-2">
                                            <div class="text-500 mb-2">Total Gingivitis</div>
                                            <div class="text-2xl font-bold text-primary">{{ totales.gingivitis }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <!-- Odontograma visual interactivo -->
                    <h5>Odontograma visual</h5>
                    <div class="odontograma-visual" style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 32px">
                        <!-- Fila superior -->
                        <div style="display: flex; gap: 4px">
                            <OdontoDiente v-for="n in 8" :key="'sup-izq-' + n" :numero="18 - n + 1" @cuadrante-click="handleCuadranteClick('sup', 18 - n + 1, $event)" />
                            <div style="width: 32px"></div>
                            <OdontoDiente v-for="n in 8" :key="'sup-der-' + n" :numero="21 + n - 1" @cuadrante-click="handleCuadranteClick('sup', 21 + n - 1, $event)" />
                        </div>
                        <!-- Fila central superior -->
                        <div style="display: flex; gap: 4px">
                            <OdontoDiente v-for="n in 8" :key="'sup-izq-leche-' + n" :numero="55 - n + 1" small @cuadrante-click="handleCuadranteClick('sup-leche', 55 - n + 1, $event)" />
                            <div style="width: 32px"></div>
                            <OdontoDiente v-for="n in 8" :key="'sup-der-leche-' + n" :numero="61 + n - 1" small @cuadrante-click="handleCuadranteClick('sup-leche', 61 + n - 1, $event)" />
                        </div>
                        <!-- Fila central inferior -->
                        <div style="display: flex; gap: 4px">
                            <OdontoDiente v-for="n in 8" :key="'inf-izq-leche-' + n" :numero="85 - n + 1" small @cuadrante-click="handleCuadranteClick('inf-leche', 85 - n + 1, $event)" />
                            <div style="width: 32px"></div>
                            <OdontoDiente v-for="n in 8" :key="'inf-der-leche-' + n" :numero="71 + n - 1" small @cuadrante-click="handleCuadranteClick('inf-leche', 71 + n - 1, $event)" />
                        </div>
                        <!-- Fila inferior -->
                        <div style="display: flex; gap: 4px">
                            <OdontoDiente v-for="n in 8" :key="'inf-izq-' + n" :numero="48 - n + 1" @cuadrante-click="handleCuadranteClick('inf', 48 - n + 1, $event)" />
                            <div style="width: 32px"></div>
                            <OdontoDiente v-for="n in 8" :key="'inf-der-' + n" :numero="31 + n - 1" @cuadrante-click="handleCuadranteClick('inf', 31 + n - 1, $event)" />
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="grid">
                        <div class="col-12">
                            <div class="card">
                                <div class="flex justify-content-end gap-2">
                                    <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cancelar" />
                                    <Button label="Guardar" icon="pi pi-check" @click="guardarFicha" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Fluid>
</template>

<style scoped>
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
