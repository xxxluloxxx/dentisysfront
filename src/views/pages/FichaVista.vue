<script setup>
import { FichaService } from '@/service/FichaMedica';
import { ImagenFichaService } from '@/service/ImagenFicha';
import { ProcedimientoService } from '@/service/ProcedimientoService';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import OdontoDiente from '@/components/OdontoDiente.vue';

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
    observaciones: '',
    fecha: null
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

// Variables para el historial de pagos
const historialPagos = ref([]);
const loadingPagos = ref(false);

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
            })
            .catch((error) => {
                console.error('Error al cargar las imágenes:', error);
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

        // Mapear odontograma visual
        if (data.datos.odontogramaVisual) {
            // Mapear dientes permanentes
            if (data.datos.odontogramaVisual.superiorDerecho) {
                data.datos.odontogramaVisual.superiorDerecho.forEach((dienteServidor) => {
                    const dienteLocal = formData.odontogramaVisual.superiorDerecho.find((d) => d.diente === dienteServidor.diente);
                    if (dienteLocal) {
                        dienteLocal.cuadrantes = dienteServidor.cuadrantes;
                    }
                });
            }
            if (data.datos.odontogramaVisual.superiorIzquierdo) {
                data.datos.odontogramaVisual.superiorIzquierdo.forEach((dienteServidor) => {
                    const dienteLocal = formData.odontogramaVisual.superiorIzquierdo.find((d) => d.diente === dienteServidor.diente);
                    if (dienteLocal) {
                        dienteLocal.cuadrantes = dienteServidor.cuadrantes;
                    }
                });
            }
            if (data.datos.odontogramaVisual.inferiorDerecho) {
                data.datos.odontogramaVisual.inferiorDerecho.forEach((dienteServidor) => {
                    const dienteLocal = formData.odontogramaVisual.inferiorDerecho.find((d) => d.diente === dienteServidor.diente);
                    if (dienteLocal) {
                        dienteLocal.cuadrantes = dienteServidor.cuadrantes;
                    }
                });
            }
            if (data.datos.odontogramaVisual.inferiorIzquierdo) {
                data.datos.odontogramaVisual.inferiorIzquierdo.forEach((dienteServidor) => {
                    const dienteLocal = formData.odontogramaVisual.inferiorIzquierdo.find((d) => d.diente === dienteServidor.diente);
                    if (dienteLocal) {
                        dienteLocal.cuadrantes = dienteServidor.cuadrantes;
                    }
                });
            }
            // Mapear dientes temporales
            if (data.datos.odontogramaVisual.superiorDerechoTemporal) {
                data.datos.odontogramaVisual.superiorDerechoTemporal.forEach((dienteServidor) => {
                    const dienteLocal = formData.odontogramaVisual.superiorDerechoTemporal.find((d) => d.diente === dienteServidor.diente);
                    if (dienteLocal) {
                        dienteLocal.cuadrantes = dienteServidor.cuadrantes;
                    }
                });
            }
            if (data.datos.odontogramaVisual.superiorIzquierdoTemporal) {
                data.datos.odontogramaVisual.superiorIzquierdoTemporal.forEach((dienteServidor) => {
                    const dienteLocal = formData.odontogramaVisual.superiorIzquierdoTemporal.find((d) => d.diente === dienteServidor.diente);
                    if (dienteLocal) {
                        dienteLocal.cuadrantes = dienteServidor.cuadrantes;
                    }
                });
            }
            if (data.datos.odontogramaVisual.inferiorDerechoTemporal) {
                data.datos.odontogramaVisual.inferiorDerechoTemporal.forEach((dienteServidor) => {
                    const dienteLocal = formData.odontogramaVisual.inferiorDerechoTemporal.find((d) => d.diente === dienteServidor.diente);
                    if (dienteLocal) {
                        dienteLocal.cuadrantes = dienteServidor.cuadrantes;
                    }
                });
            }
            if (data.datos.odontogramaVisual.inferiorIzquierdoTemporal) {
                data.datos.odontogramaVisual.inferiorIzquierdoTemporal.forEach((dienteServidor) => {
                    const dienteLocal = formData.odontogramaVisual.inferiorIzquierdoTemporal.find((d) => d.diente === dienteServidor.diente);
                    if (dienteLocal) {
                        dienteLocal.cuadrantes = dienteServidor.cuadrantes;
                    }
                });
            }
        }

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

    // Cargar historial de pagos del paciente
    await cargarHistorialPagos();
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

    odontogramaVisual: {
        // Dientes permanentes superiores (18-11, 21-28)
        superiorDerecho: [
            { diente: 18, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 17, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 16, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 15, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 14, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 13, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 12, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 11, cuadrantes: [0, 0, 0, 0, 0] }
        ],
        superiorIzquierdo: [
            { diente: 21, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 22, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 23, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 24, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 25, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 26, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 27, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 28, cuadrantes: [0, 0, 0, 0, 0] }
        ],
        // Dientes permanentes inferiores (48-41, 31-38)
        inferiorDerecho: [
            { diente: 48, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 47, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 46, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 45, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 44, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 43, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 42, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 41, cuadrantes: [0, 0, 0, 0, 0] }
        ],
        inferiorIzquierdo: [
            { diente: 31, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 32, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 33, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 34, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 35, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 36, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 37, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 38, cuadrantes: [0, 0, 0, 0, 0] }
        ],
        // Dientes temporales superiores (55-51, 61-65)
        superiorDerechoTemporal: [
            { diente: 55, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 54, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 53, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 52, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 51, cuadrantes: [0, 0, 0, 0, 0] }
        ],
        superiorIzquierdoTemporal: [
            { diente: 61, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 62, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 63, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 64, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 65, cuadrantes: [0, 0, 0, 0, 0] }
        ],
        // Dientes temporales inferiores (85-81, 71-75)
        inferiorDerechoTemporal: [
            { diente: 85, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 84, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 83, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 82, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 81, cuadrantes: [0, 0, 0, 0, 0] }
        ],
        inferiorIzquierdoTemporal: [
            { diente: 71, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 72, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 73, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 74, cuadrantes: [0, 0, 0, 0, 0] },
            { diente: 75, cuadrantes: [0, 0, 0, 0, 0] }
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

            odontogramaVisual: {
                superiorDerecho: formData.odontogramaVisual.superiorDerecho
                    .filter((diente) => diente.cuadrantes.some((c) => c > 0))
                    .map((diente) => ({
                        diente: diente.diente,
                        cuadrantes: diente.cuadrantes
                    })),
                superiorIzquierdo: formData.odontogramaVisual.superiorIzquierdo
                    .filter((diente) => diente.cuadrantes.some((c) => c > 0))
                    .map((diente) => ({
                        diente: diente.diente,
                        cuadrantes: diente.cuadrantes
                    })),
                inferiorDerecho: formData.odontogramaVisual.inferiorDerecho
                    .filter((diente) => diente.cuadrantes.some((c) => c > 0))
                    .map((diente) => ({
                        diente: diente.diente,
                        cuadrantes: diente.cuadrantes
                    })),
                inferiorIzquierdo: formData.odontogramaVisual.inferiorIzquierdo
                    .filter((diente) => diente.cuadrantes.some((c) => c > 0))
                    .map((diente) => ({
                        diente: diente.diente,
                        cuadrantes: diente.cuadrantes
                    })),
                superiorDerechoTemporal: formData.odontogramaVisual.superiorDerechoTemporal
                    .filter((diente) => diente.cuadrantes.some((c) => c > 0))
                    .map((diente) => ({
                        diente: diente.diente,
                        cuadrantes: diente.cuadrantes
                    })),
                superiorIzquierdoTemporal: formData.odontogramaVisual.superiorIzquierdoTemporal
                    .filter((diente) => diente.cuadrantes.some((c) => c > 0))
                    .map((diente) => ({
                        diente: diente.diente,
                        cuadrantes: diente.cuadrantes
                    })),
                inferiorDerechoTemporal: formData.odontogramaVisual.inferiorDerechoTemporal
                    .filter((diente) => diente.cuadrantes.some((c) => c > 0))
                    .map((diente) => ({
                        diente: diente.diente,
                        cuadrantes: diente.cuadrantes
                    })),
                inferiorIzquierdoTemporal: formData.odontogramaVisual.inferiorIzquierdoTemporal
                    .filter((diente) => diente.cuadrantes.some((c) => c > 0))
                    .map((diente) => ({
                        diente: diente.diente,
                        cuadrantes: diente.cuadrantes
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
    { label: 'Imagenes', value: '2' },
    { label: 'Historial de pagos', value: '3' }
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

        if (!nuevoProcedimiento.value.fecha) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'La fecha es requerida',
                life: 3000
            });
            return;
        }

        // Combinar la fecha seleccionada con la hora actual
        const fechaSeleccionada = new Date(nuevoProcedimiento.value.fecha);
        const ahora = new Date();
        fechaSeleccionada.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), ahora.getMilliseconds());
        const fechaCompleta = fechaSeleccionada.toISOString();

        const procedimientoData = {
            ficha: {
                id: route.params.id
            },
            procedimiento: nuevoProcedimiento.value.procedimiento,
            observaciones: nuevoProcedimiento.value.observaciones,
            fecha: fechaCompleta
        };

        await ProcedimientoService.create(procedimientoData);

        // Actualizar la lista de procedimientos
        procedimientos.value = await ProcedimientoService.getByFichaId(route.params.id);

        // Limpiar el formulario
        nuevoProcedimiento.value = {
            procedimiento: '',
            observaciones: '',
            fecha: null
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

// Funciones para el historial de pagos
const cargarHistorialPagos = async () => {
    const fichaId = route.params.id;
    if (!fichaId) return;

    loadingPagos.value = true;
    try {
        const data = await FichaService.getProformasCobranzas(fichaId);
        historialPagos.value = data || [];
        console.log('🔄 Historial de pagos cargado:', historialPagos.value);
    } catch (error) {
        console.error('Error al cargar el historial de pagos:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el historial de pagos',
            life: 3000
        });
    } finally {
        loadingPagos.value = false;
    }
};

const formatCurrency = (value) => {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return '$0.00';
};

const obtenerFecha = (value) => {
    if (value) {
        const fecha = new Date(value);
        return fecha.toISOString().split('T')[0];
    }
    return '';
};

const getEstadoSeverityProforma = (estado) => {
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
};

const getEstadoSeverity = (estado) => {
    switch (estado) {
        case 'PAGADA':
            return 'success';
        case 'PARCIAL':
            return 'warn';
        case 'CANCELADA':
            return 'danger';
        default:
            return null;
    }
};

const getEstadoSeverityMetodoPago = (estado) => {
    switch (estado) {
        case 'EFECTIVO':
            return 'success';
        case 'TRANSFERENCIA':
            return 'warn';
        case 'TARJETA':
            return 'danger';
        default:
            return null;
    }
};

const calcularTotalPagado = (cobranzas) => {
    if (!cobranzas || cobranzas.length === 0) return 0;
    return cobranzas.reduce((total, cobranza) => total + cobranza.monto, 0);
};

function handleCuadranteClick(posicion, numero, { cuadrante, estado }) {
    // Mapear la posición y número del diente a la estructura de datos correcta
    let seccion = '';

    // Determinar la sección basada en la posición y número del diente
    if (posicion === 'sup') {
        if (numero >= 11 && numero <= 18) {
            seccion = 'superiorDerecho';
        } else if (numero >= 21 && numero <= 28) {
            seccion = 'superiorIzquierdo';
        }
    } else if (posicion === 'inf') {
        if (numero >= 31 && numero <= 38) {
            seccion = 'inferiorIzquierdo';
        } else if (numero >= 41 && numero <= 48) {
            seccion = 'inferiorDerecho';
        }
    } else if (posicion === 'sup-leche') {
        if (numero >= 51 && numero <= 55) {
            seccion = 'superiorDerechoTemporal';
        } else if (numero >= 61 && numero <= 65) {
            seccion = 'superiorIzquierdoTemporal';
        }
    } else if (posicion === 'inf-leche') {
        if (numero >= 71 && numero <= 75) {
            seccion = 'inferiorIzquierdoTemporal';
        } else if (numero >= 81 && numero <= 85) {
            seccion = 'inferiorDerechoTemporal';
        }
    }

    if (seccion) {
        // Buscar el diente en la sección correspondiente
        const dienteEncontrado = formData.odontogramaVisual[seccion].find((d) => d.diente === numero);
        if (dienteEncontrado) {
            // Actualizar el estado del cuadrante (0=sin selección, 1=azul, 2=rojo)
            dienteEncontrado.cuadrantes[cuadrante - 1] = estado;
            console.log(`Diente ${numero} (${posicion}), cuadrante ${cuadrante}, estado ${estado}`);
        }
    }
}

function getDienteColores(seccion, numero) {
    const diente = formData.odontogramaVisual[seccion]?.find((d) => d.diente === numero);

    if (!diente) {
        return ['#e8f5e9', '#e8f5e9', '#e8f5e9', '#e8f5e9', '#e8f5e9'];
    }

    const colores = diente.cuadrantes.map((estado) => {
        switch (estado) {
            case 1:
                return '#1976d2'; // azul
            case 2:
                return '#d32f2f'; // rojo
            default:
                return '#e8f5e9'; // verde claro
        }
    });

    return colores;
}
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
                                        <!-- Odontograma visual interactivo -->
                                        <h5>Odontograma visual</h5>
                                        <div class="odontograma-visual" style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 32px">
                                            <!-- Fila superior -->
                                            <div style="display: flex; gap: 4px">
                                                <OdontoDiente v-for="n in 8" :key="'sup-izq-' + n" :numero="18 - n + 1" :colores="getDienteColores('superiorDerecho', 18 - n + 1)" @cuadrante-click="handleCuadranteClick('sup', 18 - n + 1, $event)" />
                                                <div style="width: 32px"></div>
                                                <OdontoDiente v-for="n in 8" :key="'sup-der-' + n" :numero="21 + n - 1" :colores="getDienteColores('superiorIzquierdo', 21 + n - 1)" @cuadrante-click="handleCuadranteClick('sup', 21 + n - 1, $event)" />
                                            </div>
                                            <!-- Fila central superior -->
                                            <div style="display: flex; gap: 4px">
                                                <OdontoDiente
                                                    v-for="n in 8"
                                                    :key="'sup-izq-leche-' + n"
                                                    :numero="55 - n + 1"
                                                    :colores="getDienteColores('superiorDerechoTemporal', 55 - n + 1)"
                                                    small
                                                    @cuadrante-click="handleCuadranteClick('sup-leche', 55 - n + 1, $event)"
                                                />
                                                <div style="width: 32px"></div>
                                                <OdontoDiente
                                                    v-for="n in 8"
                                                    :key="'sup-der-leche-' + n"
                                                    :numero="61 + n - 1"
                                                    :colores="getDienteColores('superiorIzquierdoTemporal', 61 + n - 1)"
                                                    small
                                                    @cuadrante-click="handleCuadranteClick('sup-leche', 61 + n - 1, $event)"
                                                />
                                            </div>
                                            <!-- Fila central inferior -->
                                            <div style="display: flex; gap: 4px">
                                                <OdontoDiente
                                                    v-for="n in 8"
                                                    :key="'inf-izq-leche-' + n"
                                                    :numero="85 - n + 1"
                                                    :colores="getDienteColores('inferiorDerechoTemporal', 85 - n + 1)"
                                                    small
                                                    @cuadrante-click="handleCuadranteClick('inf-leche', 85 - n + 1, $event)"
                                                />
                                                <div style="width: 32px"></div>
                                                <OdontoDiente
                                                    v-for="n in 8"
                                                    :key="'inf-der-leche-' + n"
                                                    :numero="71 + n - 1"
                                                    :colores="getDienteColores('inferiorIzquierdoTemporal', 71 + n - 1)"
                                                    small
                                                    @cuadrante-click="handleCuadranteClick('inf-leche', 71 + n - 1, $event)"
                                                />
                                            </div>
                                            <!-- Fila inferior -->
                                            <div style="display: flex; gap: 4px">
                                                <OdontoDiente v-for="n in 8" :key="'inf-izq-' + n" :numero="48 - n + 1" :colores="getDienteColores('inferiorDerecho', 48 - n + 1)" @cuadrante-click="handleCuadranteClick('inf', 48 - n + 1, $event)" />
                                                <div style="width: 32px"></div>
                                                <OdontoDiente v-for="n in 8" :key="'inf-der-' + n" :numero="31 + n - 1" :colores="getDienteColores('inferiorIzquierdo', 31 + n - 1)" @cuadrante-click="handleCuadranteClick('inf', 31 + n - 1, $event)" />
                                            </div>
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
                                        <Column field="procedimiento" header="Procedimiento" style="width: 30%"></Column>
                                        <Column field="observaciones" header="Observaciones" style="width: 50%"></Column>
                                        <Column field="fecha" header="Fecha" style="width: 15%">
                                            <template #body="slotProps">
                                                {{ slotProps.data.fecha ? slotProps.data.fecha.split('T')[0] : '' }}
                                            </template>
                                        </Column>
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
                                            <label for="fechaProcedimiento" class="font-bold block mb-2">Fecha de procedimiento</label>
                                            <Calendar id="fechaProcedimiento" v-model="nuevoProcedimiento.fecha" dateFormat="dd/mm/yy" class="w-full" />
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
                                        <div class="font-semibold text-xl">Galeria de imágenes</div>
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

                            <!-- Contenido de Historial de Pagos -->
                            <div v-if="activeTab === '3'" class="col-12">
                                <div class="card">
                                    <div class="flex justify-between items-center mb-4">
                                        <h2 class="text-lg md:text-xl font-semibold">Historial de Pagos</h2>
                                        <Button icon="pi pi-refresh" class="!w-8 !h-8 !p-0" rounded @click="cargarHistorialPagos" />
                                    </div>

                                    <div v-if="loadingPagos" class="flex justify-content-center">
                                        <ProgressSpinner />
                                    </div>

                                    <div v-else-if="historialPagos.length === 0" class="text-center p-4">
                                        <i class="pi pi-info-circle text-4xl text-gray-400 mb-2"></i>
                                        <p class="text-gray-600">No se encontraron registros de pagos para este paciente.</p>
                                    </div>

                                    <div v-else class="space-y-4">
                                        <div v-for="proforma in historialPagos" :key="proforma.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                                            <!-- Información de la proforma -->
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <h3 class="text-lg font-semibold mb-3">Información de la Proforma</h3>
                                                    <div class="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p class="font-semibold text-sm">Médico:</p>
                                                            <p class="text-sm">{{ proforma.medicoNombre }}</p>
                                                        </div>
                                                        <div>
                                                            <p class="font-semibold text-sm">Fecha:</p>
                                                            <p class="text-sm">{{ obtenerFecha(proforma.createdAt) }}</p>
                                                        </div>
                                                        <div>
                                                            <p class="font-semibold text-sm">Estado:</p>
                                                            <Tag :value="proforma.estado" :severity="getEstadoSeverityProforma(proforma.estado)" />
                                                        </div>
                                                        <div>
                                                            <p class="font-semibold text-sm">Observaciones:</p>
                                                            <p class="text-sm">{{ proforma.observaciones || 'Sin observaciones' }}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <h3 class="text-lg font-semibold mb-3">Resumen Financiero</h3>
                                                    <div class="space-y-2">
                                                        <div class="flex justify-between">
                                                            <span class="font-semibold">Subtotal:</span>
                                                            <span>{{ formatCurrency(proforma.subtotal) }}</span>
                                                        </div>
                                                        <div class="flex justify-between">
                                                            <span class="font-semibold">IVA:</span>
                                                            <span>{{ formatCurrency(proforma.iva) }}</span>
                                                        </div>
                                                        <div class="flex justify-between">
                                                            <span class="font-semibold">Descuento:</span>
                                                            <span>{{ formatCurrency(proforma.descuento) }}</span>
                                                        </div>
                                                        <div class="flex justify-between text-lg font-bold border-t pt-2">
                                                            <span>Total:</span>
                                                            <span class="text-primary">{{ formatCurrency(proforma.total) }}</span>
                                                        </div>
                                                        <div class="flex justify-between text-sm">
                                                            <span class="font-semibold">Total Pagado:</span>
                                                            <span class="text-success">{{ formatCurrency(calcularTotalPagado(proforma.cobranzas)) }}</span>
                                                        </div>
                                                        <div class="flex justify-between text-sm">
                                                            <span class="font-semibold">Pendiente:</span>
                                                            <span class="text-warning">{{ formatCurrency(proforma.total - calcularTotalPagado(proforma.cobranzas)) }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Tabla de cobranzas -->
                                            <div v-if="proforma.cobranzas && proforma.cobranzas.length > 0">
                                                <h4 class="text-md font-semibold mb-3">Detalle de Pagos</h4>
                                                <DataTable :value="proforma.cobranzas" class="p-datatable-sm" stripedRows rowHover>
                                                    <Column field="fechaPago" header="Fecha de Pago" style="width: 15%">
                                                        <template #body="slotProps">
                                                            {{ obtenerFecha(slotProps.data.fechaPago) }}
                                                        </template>
                                                    </Column>
                                                    <Column field="monto" header="Monto" style="width: 15%">
                                                        <template #body="slotProps">
                                                            {{ formatCurrency(slotProps.data.monto) }}
                                                        </template>
                                                    </Column>
                                                    <Column field="metodoPago" header="Método de Pago" style="width: 15%">
                                                        <template #body="slotProps">
                                                            <Tag :value="slotProps.data.metodoPago" :severity="getEstadoSeverityMetodoPago(slotProps.data.metodoPago)" />
                                                        </template>
                                                    </Column>
                                                    <Column field="estado" header="Estado" style="width: 15%">
                                                        <template #body="slotProps">
                                                            <Tag :value="slotProps.data.estado" :severity="getEstadoSeverity(slotProps.data.estado)" />
                                                        </template>
                                                    </Column>
                                                    <Column field="observaciones" header="Observaciones" style="width: 40%">
                                                        <template #body="slotProps">
                                                            {{ slotProps.data.observaciones || 'Sin observaciones' }}
                                                        </template>
                                                    </Column>
                                                </DataTable>
                                            </div>

                                            <div v-else class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <i class="pi pi-exclamation-triangle text-2xl text-gray-400 mb-2"></i>
                                                <p class="text-gray-600">No se han registrado pagos para esta proforma.</p>
                                            </div>
                                        </div>
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
