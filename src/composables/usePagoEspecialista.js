import { CobranzaService } from '@/service/CobranzaService';
import { CuentasService } from '@/service/CuentasService';
import { MedicoService } from '@/service/MedicoService';
import { PacienteService } from '@/service/PacienteService';
import { ProformaService } from '@/service/ProformaService';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';

export function usePagoEspecialista() {
    const toast = useToast();

    // Estados reactivos
    const pacientes = ref([]);
    const medicos = ref([]);
    const proformas = ref([]);
    const cobranzas = ref([]);
    const loading = ref(false);
    const loadingProformas = ref(false);
    const loadingCobranzas = ref(false);
    const loadingPago = ref(false);
    const selectedPaciente = ref(null);
    const selectedMedico = ref(null);
    const selectedProforma = ref(null);
    const selectedCobranza = ref(null);
    const searchTerm = ref('');
    const currentStep = ref(1);
    const montoPago = ref(null);
    const descripcionPago = ref('Pago a especialista');

    // Computed properties
    const filteredPacientes = computed(() => {
        if (!searchTerm.value) return pacientes.value;

        return pacientes.value.filter(
            (paciente) => paciente.nombre?.toLowerCase().includes(searchTerm.value.toLowerCase()) || paciente.apellido?.toLowerCase().includes(searchTerm.value.toLowerCase()) || paciente.identificacion?.includes(searchTerm.value)
        );
    });

    const filteredMedicos = computed(() => {
        return medicos.value;
    });

    const filteredProformas = computed(() => {
        if (!searchTerm.value) return proformas.value;

        return proformas.value.filter((proforma) => proforma.numero?.toLowerCase().includes(searchTerm.value.toLowerCase()) || proforma.estado?.toLowerCase().includes(searchTerm.value.toLowerCase()));
    });

    // Función para cargar pacientes
    async function cargarPacientes() {
        try {
            loading.value = true;
            const data = await PacienteService.getAll();
            pacientes.value = data;
            console.log('✅ Pacientes cargados:', data.length);
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar los pacientes',
                life: 4000
            });
        } finally {
            loading.value = false;
        }
    }

    // Función para cargar médicos
    async function cargarMedicos() {
        try {
            loading.value = true;
            const data = await MedicoService.getAll();
            medicos.value = data;
            console.log('✅ Médicos cargados:', data.length);
        } catch (error) {
            console.error('Error al cargar médicos:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar los médicos',
                life: 4000
            });
        } finally {
            loading.value = false;
        }
    }

    // Función para cargar proformas del paciente
    async function cargarProformas(pacienteId) {
        try {
            loadingProformas.value = true;
            const data = await ProformaService.getByPaciente(pacienteId);
            proformas.value = data;
            console.log('✅ Proformas cargadas:', data.length);
        } catch (error) {
            console.error('Error al cargar proformas:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar las proformas del paciente',
                life: 4000
            });
        } finally {
            loadingProformas.value = false;
        }
    }

    // Función para cargar cobranzas de la proforma
    async function cargarCobranzas(proformaId) {
        try {
            loadingCobranzas.value = true;
            const data = await CobranzaService.getByProformaId(proformaId);
            cobranzas.value = data;
            console.log('✅ Cobranzas cargadas:', data.length);
        } catch (error) {
            console.error('Error al cargar cobranzas:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar las cobranzas de la proforma',
                life: 4000
            });
        } finally {
            loadingCobranzas.value = false;
        }
    }

    // Función para procesar el pago
    async function procesarPago() {
        try {
            loadingPago.value = true;

            // Validar que el monto sea válido
            if (!montoPago.value || montoPago.value <= 0) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Debe especificar un monto válido para el pago',
                    life: 4000
                });
                return;
            }

            // Validar que se haya seleccionado una cobranza
            if (!selectedCobranza.value) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Debe seleccionar una cobranza para procesar el pago',
                    life: 4000
                });
                return;
            }

            // Obtener la fecha actual en formato YYYY-MM-DD
            const fechaActual = new Date().toISOString().split('T')[0];

            // Preparar los datos para la petición
            const datosPago = {
                categoriaId: 5,
                cobranzaId: selectedCobranza.value.id,
                medicoId: selectedMedico.value.id,
                monto: montoPago.value,
                fechaMovimiento: fechaActual,
                descripcion: descripcionPago.value
            };

            console.log('📤 Enviando datos de pago:', datosPago);

            // Hacer la petición al servicio de cuentas
            const respuesta = await CuentasService.create(datosPago);

            console.log('✅ Respuesta del servidor:', respuesta);

            // Mostrar mensaje de éxito
            toast.add({
                severity: 'success',
                summary: 'Pago Exitoso',
                detail: `El pago de $${montoPago.value.toFixed(2)} al especialista se ha procesado correctamente`,
                life: 5000
            });

            // Limpiar selecciones y volver al paso 1
            limpiarSelecciones();
            currentStep.value = 1;

            console.log('✅ Pago procesado exitosamente:', montoPago.value);
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error al procesar el pago. Intente nuevamente.',
                life: 4000
            });
        } finally {
            loadingPago.value = false;
        }
    }

    // Función para seleccionar paciente
    function seleccionarPaciente(paciente) {
        selectedPaciente.value = paciente;
        console.log('✅ Paciente seleccionado:', paciente);
    }

    // Función para seleccionar médico
    function seleccionarMedico(medico) {
        selectedMedico.value = medico;
        console.log('✅ Médico seleccionado:', medico);
    }

    // Función para seleccionar proforma
    function seleccionarProforma(proforma) {
        selectedProforma.value = proforma;
        console.log('✅ Proforma seleccionada:', proforma);
    }

    // Función para seleccionar cobranza
    function seleccionarCobranza(cobranza) {
        selectedCobranza.value = cobranza;
        console.log('✅ Cobranza seleccionada:', cobranza);
    }

    // Función para limpiar selecciones
    function limpiarSelecciones() {
        selectedPaciente.value = null;
        selectedMedico.value = null;
        selectedProforma.value = null;
        selectedCobranza.value = null;
        searchTerm.value = '';
        montoPago.value = null;
        descripcionPago.value = 'Pago a especialista';
        proformas.value = [];
        cobranzas.value = [];
    }

    // Función para ir al siguiente paso
    function nextStep() {
        if (currentStep.value < 5) {
            currentStep.value++;
            // Limpiar el término de búsqueda al cambiar de paso
            searchTerm.value = '';
            // Cargar proformas cuando se llega al paso 3
            if (currentStep.value === 3 && selectedPaciente.value) {
                cargarProformas(selectedPaciente.value.id);
            }
            // Cargar cobranzas cuando se llega al paso 4
            if (currentStep.value === 4 && selectedProforma.value) {
                cargarCobranzas(selectedProforma.value.id);
            }
        }
    }

    // Función para ir al paso anterior
    function previousStep() {
        if (currentStep.value > 1) {
            currentStep.value--;
            // Limpiar el término de búsqueda al retroceder
            searchTerm.value = '';
        }
    }

    // Función para ir a un paso específico
    function goToStep(step) {
        if (step >= 1 && step <= 5) {
            currentStep.value = step;
            // Limpiar el término de búsqueda al cambiar de paso
            searchTerm.value = '';
            // Cargar proformas si se va al paso 3
            if (step === 3 && selectedPaciente.value) {
                cargarProformas(selectedPaciente.value.id);
            }
            // Cargar cobranzas si se va al paso 4
            if (step === 4 && selectedProforma.value) {
                cargarCobranzas(selectedProforma.value.id);
            }
        }
    }

    // Función para obtener información completa
    async function cargarDatosCompletos() {
        await Promise.all([cargarPacientes(), cargarMedicos()]);
    }

    return {
        // Estados
        pacientes,
        medicos,
        proformas,
        cobranzas,
        loading,
        loadingProformas,
        loadingCobranzas,
        loadingPago,
        selectedPaciente,
        selectedMedico,
        selectedProforma,
        selectedCobranza,
        searchTerm,
        currentStep,
        montoPago,
        descripcionPago,

        // Computed
        filteredPacientes,
        filteredMedicos,
        filteredProformas,

        // Funciones
        cargarPacientes,
        cargarMedicos,
        cargarProformas,
        cargarCobranzas,
        cargarDatosCompletos,
        seleccionarPaciente,
        seleccionarMedico,
        seleccionarProforma,
        seleccionarCobranza,
        limpiarSelecciones,
        procesarPago,
        nextStep,
        previousStep,
        goToStep
    };
}
