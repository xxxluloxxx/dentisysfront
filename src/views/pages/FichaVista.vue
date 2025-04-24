<script setup>
import { FichaService } from '@/service/FichaMedica';
import { ImagenFichaService } from '@/service/ImagenFicha';
import { ProcedimientoService } from '@/service/ProcedimientoService';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const procedimiento = ref(null);
const procedimientos = ref([]);
const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(true);
const paciente = ref(null);
const error = ref(null);
const mostrarDialogoProcedimiento = ref(false);
const mostrarDialogoConfirmacion = ref(false);
const procedimientoAEliminar = ref(null);
const imagenAEliminar = ref(null);
const fileupload = ref(null);
const nuevoProcedimiento = ref({
    procedimiento: '',
    observaciones: ''
});
const imagenesFicha = ref([]);
const visible = ref(false);
const imagenSeleccionada = ref(null);
const mostrarDialogoImagen = ref(false);
const nuevaImagen = ref({
    nombre: '',
    descripcion: '',
    tipoImagen: 'radiografia',
    imagenBase64: ''
});

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

onMounted(async () => {
    try {
        const fichaId = route.params.id;
        if (!fichaId) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'ID de proforma no válido', life: 3000 });
            router.push('/pages/fichasMedicas');
            return;
        }

        ImagenFichaService.getAll()
            .then((data) => {
                imagenesFicha.value = data.map((imagen) => ({
                    ...imagen,
                    imagenBase64: imagen.imagen || imagen.imagenBase64
                }));
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Imágenes cargadas correctamente', life: 3000 });
            })
            .catch((error) => {
                console.error('Error al cargar las imágenes:', error);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las imágenes', life: 3000 });
            });

        console.log('🔄 Imágenes cargadas:');
        console.log(imagenesFicha.value);

        const data = await FichaService.getById(fichaId);

        if (!data || !data.paciente) {
            throw new Error('No se encontró información del paciente');
        }

        paciente.value = data.paciente;
        console.log('🔄 Paciente obtenido:');
        console.log(paciente.value);

        // Cargar procedimientos
        procedimientos.value = await ProcedimientoService.getByFichaId(fichaId);
        console.log('🔄 Procedimientos obtenidos:');
        console.log(procedimientos.value);

        // Mapear los datos recibidos a las variables reactivas
        formData.motivoConsulta = data.datos.datosFicha.motivoConsulta;
        formData.problemaActual = data.datos.datosFicha.descripcion;

        // Mapear signos vitales
        formData.signosVitales = data.datos.signosVitales.map((signo) => ({
            signo: signo.nombre,
            valor: signo.valor
        }));

        // Mapear odontograma
        formData.odontograma.superiorDerecho = data.datos.odontograma.superiorDerecho;
        formData.odontograma.superiorIzquierdo = data.datos.odontograma.superiorIzquierdo;
        formData.odontograma.inferiorDerecho = data.datos.odontograma.inferiorDerecho;
        formData.odontograma.inferiorIzquierdo = data.datos.odontograma.inferiorIzquierdo;

        // Mapear higiene oral
        formData.higieneOral = data.datos.higieneOral.map((item) => ({
            p1: item.puntos.p1.valor,
            check1: item.puntos.p1.marcado,
            p2: item.puntos.p2.valor,
            check2: item.puntos.p2.marcado,
            p3: item.puntos.p3.valor,
            check3: item.puntos.p3.marcado,
            placa: item.placa || '',
            calculo: item.calculo || '',
            gingivitis: item.gingivitis || ''
        }));

        // Actualizar totales
        formData.totales = data.datos.totales;

        // Mapear antecedentes
        if (data.datos.antecedentes && data.datos.antecedentes.length > 0) {
            formData.antecedentes = data.datos.antecedentes.map((antecedente) => ({
                nombre: antecedente.nombre,
                check: antecedente.check,
                descripcion: antecedente.descripcion
            }));
        }

        // Mapear examen estomatognático
        if (data.datos.examenEstomatognatico && data.datos.examenEstomatognatico.length > 0) {
            formData.examenEstomatognatico = data.datos.examenEstomatognatico.map((examen) => ({
                examen: examen.nombre,
                tiene: true,
                descripcion: examen.descripcion
            }));
        }
    } catch (error) {
        console.error('Error al cargar la proforma:', error);
        error.value = error.message || 'Error al cargar la proforma';
        toast.add({ severity: 'error', summary: 'Error', detail: error.value, life: 3000 });
        router.push('/pages/fichasMedicas');
    } finally {
        loading.value = false;
    }

    console.log('Iniciando la ficha, con el procedimiento id: ', 1);
    procedimiento.value = ProcedimientoService.getById(1);
    console.log(procedimiento.value);
});

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

const actualizarFicha = async () => {
    // Crear objeto con los datos formateados
    const fichaData = {
        paciente: {
            id: paciente.value.id
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

    // Imprimir el objeto JSON completo
    //console.log('Datos de la ficha:', JSON.stringify(fichaData, null, 2));

    try {
        await FichaService.update(route.params.id, fichaData);
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Ficha médica actualizada correctamente',
            life: 3000
        });
    } catch (error) {
        console.error('Error al actualizar la ficha:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar la ficha médica',
            life: 3000
        });
    }
};

const cancelar = () => {
    router.push('/pages/fichasMedicas');
};

const options = [
    { label: 'Ficha', value: '0' },
    { label: 'Procedimientos', value: '1' },
    { label: 'Imagenes', value: '2' }
];

const activeTab = ref('0');

const agregarProcedimiento = async () => {
    try {
        if (!nuevoProcedimiento.value.procedimiento) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El procedimiento es requerido',
                life: 3000
            });
            return;
        }

        const procedimientoData = {
            ficha: {
                id: route.params.id
            },
            procedimiento: nuevoProcedimiento.value.procedimiento,
            observaciones: nuevoProcedimiento.value.observaciones
        };

        await ProcedimientoService.create(procedimientoData);

        // Actualizar la lista de procedimientos
        procedimientos.value = await ProcedimientoService.getByFichaId(route.params.id);

        // Limpiar el formulario
        nuevoProcedimiento.value = {
            procedimiento: '',
            observaciones: ''
        };

        mostrarDialogoProcedimiento.value = false;

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Procedimiento agregado correctamente',
            life: 3000
        });
    } catch (error) {
        console.error('Error al agregar el procedimiento:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al agregar el procedimiento',
            life: 3000
        });
    }
};

const deleteServicio = async (procedimiento) => {
    procedimientoAEliminar.value = procedimiento;
    mostrarDialogoConfirmacion.value = true;
};

const deleteImagen = async (imagen) => {
    imagenAEliminar.value = imagen;
    mostrarDialogoConfirmacion.value = true;
};

const confirmarEliminacion = async () => {
    try {
        if (imagenAEliminar.value) {
            await ImagenFichaService.delete(imagenAEliminar.value.id);
            // Actualizar la lista de imágenes
            const data = await ImagenFichaService.getAll();
            imagenesFicha.value = data.map((imagen) => ({
                ...imagen,
                imagenBase64: imagen.imagen || imagen.imagenBase64
            }));
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Imagen eliminada correctamente',
                life: 3000
            });
        } else if (procedimientoAEliminar.value) {
            await ProcedimientoService.delete(procedimientoAEliminar.value.id);
            procedimientos.value = await ProcedimientoService.getByFichaId(route.params.id);
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Procedimiento eliminado correctamente',
                life: 3000
            });
        }
        mostrarDialogoConfirmacion.value = false;
        imagenAEliminar.value = null;
        procedimientoAEliminar.value = null;
    } catch (error) {
        console.error('Error al eliminar:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar el elemento',
            life: 3000
        });
    }
};

const mostrarImagen = (imagen) => {
    imagenSeleccionada.value = imagen;
    visible.value = true;
};

const onUpload = (event) => {
    console.log('Evento de upload recibido:', event);
    if (event.files && event.files.length > 0) {
        const file = event.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const base64 = e.target.result;
            console.log('Base64 de la imagen:', base64);
            nuevaImagen.value.imagenBase64 = base64;
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

const upload = async () => {
    console.log('Botón upload presionado');
    if (!nuevaImagen.value.nombre || !nuevaImagen.value.descripcion || !nuevaImagen.value.imagenBase64) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Por favor complete todos los campos requeridos',
            life: 3000
        });
        return;
    }

    try {
        console.log('Iniciando upload...');

        // Crear el objeto con el formato requerido
        const imagenData = {
            fichaId: route.params.id,
            nombre: nuevaImagen.value.nombre,
            tipoImagen: nuevaImagen.value.tipoImagen,
            descripcion: nuevaImagen.value.descripcion,
            imagenBase64: nuevaImagen.value.imagenBase64
        };

        // Enviar al servicio
        await ImagenFichaService.create(imagenData);

        // Actualizar la lista de imágenes
        const data = await ImagenFichaService.getAll();
        imagenesFicha.value = data.map((imagen) => ({
            ...imagen,
            imagenBase64: imagen.imagen || imagen.imagenBase64
        }));

        // Limpiar el formulario
        nuevaImagen.value = {
            nombre: '',
            descripcion: '',
            tipoImagen: 'radiografia',
            imagenBase64: ''
        };

        // Cerrar el diálogo
        mostrarDialogoImagen.value = false;

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Imagen subida correctamente',
            life: 3000
        });
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al subir la imagen',
            life: 3000
        });
    }
};
</script>
<template>
    <Fluid>
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <h5>Ficha de {{ paciente?.nombre }} {{ paciente?.apellido }}</h5>
                    <SelectButton v-model="activeTab" :options="options" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div class="card">
                    <div v-if="loading" class="flex justify-content-center">
                        <ProgressSpinner />
                    </div>
                    <div v-else-if="error" class="flex justify-content-center">
                        <div class="text-red-500">{{ error }}</div>
                    </div>
                    <div v-else>
                        <div class="grid">
                            <!-- Contenido de Ficha -->
                            <div v-if="activeTab === '0'" class="col-12">
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
                                        <div class="grid">
                                            <div class="col-12">
                                                <div class="card">
                                                    <div class="flex justify-content-end gap-2">
                                                        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cancelar" />
                                                        <Button label="Actualizar" icon="pi pi-check" @click="actualizarFicha" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Contenido de Procedimientos -->
                            <div v-if="activeTab === '1'" class="col-12">
                                <div class="card">
                                    <div class="flex justify-between items-center mb-2">
                                        <h2 class="text-lg md:text-xl font-semibold">Procedimientos realizados</h2>
                                        <Button type="button" icon="pi pi-plus" class="!w-8 !h-8 !p-0" rounded @click="mostrarDialogoProcedimiento = true" />
                                    </div>
                                    <DataTable
                                        :value="procedimientos"
                                        :paginator="false"
                                        :rows="10"
                                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                        :rowsPerPageOptions="[5, 10, 20]"
                                        responsiveLayout="scroll"
                                    >
                                        <Column field="procedimiento" header="Procedimiento" style="width: 10%"></Column>
                                        <Column field="observaciones" header="Observaciones" style="width: 85%"></Column>
                                        <Column :exportable="false" style="width: 5%">
                                            <template #body="slotProps">
                                                <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2 !w-8 !h-8" @click="deleteServicio(slotProps.data)" />
                                            </template>
                                        </Column>
                                    </DataTable>
                                </div>
                            </div>

                            <!-- Diálogo para agregar nuevo procedimiento -->
                            <Dialog v-model:visible="mostrarDialogoProcedimiento" header="Agregar Nuevo Procedimiento" :modal="true" :style="{ width: '50vw' }">
                                <div class="grid">
                                    <div class="col-12">
                                        <div class="field mb-4">
                                            <label for="procedimiento" class="font-bold block mb-2">Procedimiento</label>
                                            <InputText id="procedimiento" v-model="nuevoProcedimiento.procedimiento" class="w-full" />
                                        </div>
                                        <div class="field mb-4">
                                            <label for="observaciones" class="font-bold block mb-2">Observaciones</label>
                                            <Textarea id="observaciones" v-model="nuevoProcedimiento.observaciones" rows="3" class="w-full" />
                                        </div>
                                    </div>
                                </div>
                                <template #footer>
                                    <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="mostrarDialogoProcedimiento = false" />
                                    <Button label="Guardar" icon="pi pi-check" @click="agregarProcedimiento" />
                                </template>
                            </Dialog>

                            <!-- Diálogo de confirmación para eliminar procedimiento -->
                            <Dialog v-model:visible="mostrarDialogoConfirmacion" header="Confirmar Eliminación" :modal="true" :style="{ width: '30vw' }">
                                <div class="confirmation-content">
                                    <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                                    <span>¿Está seguro de que desea eliminar {{ imagenAEliminar ? 'esta imagen' : 'este procedimiento' }}?</span>
                                </div>
                                <template #footer>
                                    <Button label="No" icon="pi pi-times" class="p-button-text" @click="mostrarDialogoConfirmacion = false" />
                                    <Button label="Sí" icon="pi pi-check" class="p-button-danger" @click="confirmarEliminacion" />
                                </template>
                            </Dialog>

                            <!-- Contenido de Imágenes -->
                            <div v-if="activeTab === '2'" class="col-12">
                                <div class="card">
                                    <div class="flex align-items-center gap-3 mb-4">
                                        <Button icon="pi pi-plus" class="!w-2rem !h-2rem" rounded @click="mostrarDialogoImagen = true" />
                                        <div class="font-semibold text-xl">Carousel de Imágenes de Ficha</div>
                                    </div>
                                    <div class="relative">
                                        <Carousel :value="imagenesFicha" :numVisible="3" :numScroll="3" :responsiveOptions="carouselResponsiveOptions">
                                            <template #item="slotProps">
                                                <div class="border border-surface-200 dark:border-surface-700 rounded m-2 p-4">
                                                    <div class="mb-4">
                                                        <div class="relative mx-auto">
                                                            <img :src="slotProps.data.imagenBase64" :alt="'Imagen de ficha'" class="w-full rounded cursor-pointer hover:opacity-80 transition-opacity" @click="mostrarImagen(slotProps.data)" />
                                                            <Button icon="pi pi-trash" class="p-button-danger p-button-rounded p-button-text absolute top-0 right-0 m-2" @click.stop="deleteImagen(slotProps.data)" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                        </Carousel>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Fluid>

    <!-- Diálogo para mostrar la imagen seleccionada -->
    <Dialog v-model:visible="visible" modal :style="{ width: '90vw', maxWidth: '800px' }">
        <div class="image-container">
            <img v-if="imagenSeleccionada" :src="imagenSeleccionada.imagenBase64" :alt="'Imagen de ficha'" class="w-full rounded" />
        </div>
    </Dialog>

    <!-- Diálogo para agregar nueva imagen -->
    <Dialog v-model:visible="mostrarDialogoImagen" header="Agregar Nueva Imagen" :modal="true" :style="{ width: '50vw' }">
        <div class="grid">
            <div class="col-12">
                <div class="field mb-4">
                    <label for="nombreImagen" class="font-bold block mb-2">Nombre</label>
                    <InputText id="nombreImagen" v-model="nuevaImagen.nombre" class="w-full" />
                </div>
                <div class="field mb-4">
                    <label for="descripcionImagen" class="font-bold block mb-2">Descripción</label>
                    <Textarea id="descripcionImagen" v-model="nuevaImagen.descripcion" rows="3" class="w-full" />
                </div>
                <div class="field mb-4">
                    <label for="tipoImagen" class="font-bold block mb-2">Tipo de Imagen</label>
                    <Dropdown id="tipoImagen" v-model="nuevaImagen.tipoImagen" :options="['radiografia', 'foto', 'otro']" class="w-full" />
                </div>
                <div class="field mb-4">
                    <label class="font-bold block mb-2">Imagen</label>
                    <FileUpload ref="fileupload" mode="basic" name="demo[]" accept="image/*" :maxFileSize="1000000" @select="onUpload" :auto="false" />
                </div>
            </div>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="mostrarDialogoImagen = false" />
            <Button label="Guardar" icon="pi pi-check" @click="upload" />
        </template>
    </Dialog>
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
