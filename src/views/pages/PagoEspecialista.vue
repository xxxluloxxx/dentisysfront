<script setup>
import MedicosList from '@/components/pago-especialista/MedicosList.vue';
import PacientesList from '@/components/pago-especialista/PacientesList.vue';
import '@/components/pago-especialista/PagoEspecialistaStyles.css';
import ProformasList from '@/components/pago-especialista/ProformasList.vue';
import { usePagoEspecialista } from '@/composables/usePagoEspecialista';
import { onMounted } from 'vue';

// Composable para la funcionalidad de pago a especialistas
const {
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
    cargarPacientes,
    cargarMedicos,
    cargarProformas,
    cargarDatosCompletos,
    seleccionarPaciente,
    seleccionarMedico,
    seleccionarProforma,
    procesarPago,
    nextStep,
    previousStep
} = usePagoEspecialista();

// Lifecycle
onMounted(() => {
    cargarDatosCompletos();
});
</script>

<template>
    <div class="pago-especialista-container">
        <!-- Header principal -->
        <div class="header-section">
            <div class="flex items-center gap-3 mb-6">
                <div class="header-icon">
                    <i class="pi pi-credit-card text-3xl"></i>
                </div>
                <div>
                    <h1 class="text-3xl font-bold" style="color: var(--text-color)">Pago a Especialistas</h1>
                    <p style="color: var(--text-color-secondary)">Gestiona los pagos a los especialistas médicos</p>
                </div>
            </div>
        </div>

        <!-- Breadcrumb de pasos -->
        <div class="steps-container mb-6">
            <div class="flex items-center gap-4">
                <div class="step-item" :class="{ active: currentStep >= 1 }">
                    <div class="step-number">1</div>
                    <div class="step-info">
                        <h3 class="step-title">Seleccionar Paciente</h3>
                        <p class="step-description">Elige el paciente para el pago</p>
                    </div>
                </div>
                <div class="step-divider"></div>
                <div class="step-item" :class="{ active: currentStep >= 2 }">
                    <div class="step-number">2</div>
                    <div class="step-info">
                        <h3 class="step-title">Seleccionar Especialista</h3>
                        <p class="step-description">Elige el especialista</p>
                    </div>
                </div>
                <div class="step-divider"></div>
                <div class="step-item" :class="{ active: currentStep >= 3 }">
                    <div class="step-number">3</div>
                    <div class="step-info">
                        <h3 class="step-title">Seleccionar Proforma</h3>
                        <p class="step-description">Elige la proforma</p>
                    </div>
                </div>
                <div class="step-divider"></div>
                <div class="step-item" :class="{ active: currentStep >= 4 }">
                    <div class="step-number">4</div>
                    <div class="step-info">
                        <h3 class="step-title">Revisar Cobranzas</h3>
                        <p class="step-description">Revisa las cobranzas</p>
                    </div>
                </div>
                <div class="step-divider"></div>
                <div class="step-item" :class="{ active: currentStep >= 5 }">
                    <div class="step-number">5</div>
                    <div class="step-info">
                        <h3 class="step-title">Confirmar Pago</h3>
                        <p class="step-description">Confirma el pago</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contenido principal -->
        <div class="main-content">
            <!-- Paso 1: Selección de Paciente -->
            <div v-if="currentStep === 1" class="step-content">
                <PacientesList
                    :loading="loading"
                    :pacientes="pacientes"
                    :selected-paciente="selectedPaciente"
                    :search-term="searchTerm"
                    @select-paciente="seleccionarPaciente"
                    @cargar-pacientes="cargarPacientes"
                    @update:search-term="(value) => (searchTerm = value)"
                />

                <!-- Botón para siguiente paso -->
                <div class="flex justify-end mt-6">
                    <Button label="Siguiente Paso" icon="pi pi-arrow-right" :disabled="!selectedPaciente" @click="nextStep" />
                </div>
            </div>

            <!-- Paso 2: Selección de Especialista -->
            <div v-if="currentStep === 2" class="step-content">
                <MedicosList :loading="loading" :medicos="medicos" :selected-medico="selectedMedico" :search-term="searchTerm" @select-medico="seleccionarMedico" @cargar-medicos="cargarMedicos" @update:search-term="(value) => (searchTerm = value)" />

                <!-- Botones de navegación -->
                <div class="flex justify-between mt-6">
                    <Button label="Paso Anterior" icon="pi pi-arrow-left" severity="secondary" @click="previousStep" />
                    <Button label="Siguiente Paso" icon="pi pi-arrow-right" :disabled="!selectedMedico" @click="nextStep" />
                </div>
            </div>

            <!-- Paso 3: Selección de Proforma -->
            <div v-if="currentStep === 3" class="step-content">
                <ProformasList
                    :loading="loadingProformas"
                    :proformas="proformas"
                    :selected-paciente="selectedPaciente"
                    :selected-proforma="selectedProforma"
                    :search-term="searchTerm"
                    @select-proforma="seleccionarProforma"
                    @cargar-proformas="() => cargarProformas(selectedPaciente.id)"
                    @update:search-term="(value) => (searchTerm = value)"
                />

                <!-- Botones de navegación -->
                <div class="flex justify-between mt-6">
                    <Button label="Paso Anterior" icon="pi pi-arrow-left" severity="secondary" @click="previousStep" />
                    <Button label="Siguiente Paso" icon="pi pi-arrow-right" :disabled="!selectedProforma" @click="nextStep" />
                </div>
            </div>

            <!-- Paso 4: Revisar Cobranzas -->
            <div v-if="currentStep === 4" class="step-content">
                <div class="p-6">
                    <!-- Resumen de selecciones -->
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold mb-4" style="color: var(--text-color)">Resumen del Pago</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- Paciente -->
                            <div class="summary-card-compact">
                                <div class="summary-header">
                                    <i class="pi pi-user mr-2"></i>
                                    <h4 class="font-semibold">Paciente</h4>
                                </div>
                                <div class="summary-content">
                                    <div class="patient-info">
                                        <h5 class="font-medium">{{ selectedPaciente?.nombre }} {{ selectedPaciente?.apellido }}</h5>
                                        <p>{{ selectedPaciente?.identificacion }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Médico -->
                            <div class="summary-card-compact">
                                <div class="summary-header">
                                    <i class="pi pi-user-md mr-2"></i>
                                    <h4 class="font-semibold">Especialista</h4>
                                </div>
                                <div class="summary-content">
                                    <div class="patient-info">
                                        <h5 class="font-medium">{{ selectedMedico?.nombre }} {{ selectedMedico?.apellido }}</h5>
                                        <p>{{ selectedMedico?.especialidad }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Proforma -->
                            <div class="summary-card-compact">
                                <div class="summary-header">
                                    <i class="pi pi-file mr-2"></i>
                                    <h4 class="font-semibold">Proforma</h4>
                                </div>
                                <div class="summary-content">
                                    <div class="patient-info">
                                        <h5 class="font-medium">{{ selectedProforma?.numero }}</h5>
                                        <p>{{ selectedProforma?.estado }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Información de Cobranzas -->
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold mb-4" style="color: var(--text-color)">Cobranzas de la Proforma</h3>

                        <div v-if="loadingCobranzas" class="text-center py-8">
                            <i class="pi pi-spin pi-spinner text-3xl mb-2" style="color: var(--primary-color)"></i>
                            <p style="color: var(--text-color-secondary)">Cargando cobranzas...</p>
                        </div>

                        <div v-else-if="cobranzas.length === 0" class="text-center py-8">
                            <i class="pi pi-info-circle text-3xl mb-2" style="color: var(--text-color-secondary)"></i>
                            <p style="color: var(--text-color-secondary)">No se encontraron cobranzas para esta proforma</p>
                        </div>

                        <div v-else class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b" style="border-color: var(--surface-border)">
                                        <th class="text-left p-3 font-semibold" style="color: var(--text-color)">Seleccionar</th>
                                        <th class="text-left p-3 font-semibold" style="color: var(--text-color)">Fecha</th>
                                        <th class="text-left p-3 font-semibold" style="color: var(--text-color)">Hora</th>
                                        <th class="text-left p-3 font-semibold" style="color: var(--text-color)">Monto</th>
                                        <th class="text-left p-3 font-semibold" style="color: var(--text-color)">Estado</th>
                                        <th class="text-left p-3 font-semibold" style="color: var(--text-color)">Método</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="cobranza in cobranzas" :key="cobranza.id" class="border-b" style="border-color: var(--surface-border)">
                                        <td class="p-3">
                                            <RadioButton :value="cobranza" v-model="selectedCobranza" :inputId="'cobranza-' + cobranza.id" name="cobranza" />
                                        </td>
                                        <td class="p-3" style="color: var(--text-color)">{{ cobranza.createdAt ? new Date(cobranza.createdAt).toLocaleDateString() : 'N/A' }}</td>
                                        <td class="p-3" style="color: var(--text-color)">{{ cobranza.createdAt ? new Date(cobranza.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A' }}</td>
                                        <td class="p-3 font-semibold" style="color: var(--primary-color)">${{ cobranza.monto ? cobranza.monto.toFixed(2) : '0.00' }}</td>
                                        <td class="p-3">
                                            <span
                                                class="px-2 py-1 rounded-full text-xs font-medium"
                                                :class="{
                                                    'bg-green-100 text-green-800': cobranza.estado === 'PAGADO',
                                                    'bg-yellow-100 text-yellow-800': cobranza.estado === 'PENDIENTE',
                                                    'bg-red-100 text-red-800': cobranza.estado === 'VENCIDO',
                                                    'bg-gray-100 text-gray-800': !cobranza.estado
                                                }"
                                            >
                                                {{ cobranza.estado || 'N/A' }}
                                            </span>
                                        </td>
                                        <td class="p-3" style="color: var(--text-color)">{{ cobranza.metodoPago || 'N/A' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Resumen de totales -->
                        <div v-if="cobranzas.length > 0" class="mt-6 p-4 rounded-lg" style="background-color: var(--surface-section); border: 1px solid var(--surface-border)">
                            <div class="flex justify-between items-center">
                                <span class="font-semibold" style="color: var(--text-color)">Total Cobrado:</span>
                                <span class="font-bold text-lg" style="color: var(--primary-color)"> ${{ cobranzas.reduce((total, cobranza) => total + (cobranza.monto || 0), 0).toFixed(2) }} </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Botones de navegación -->
                <div class="flex justify-between mt-6 p-6 border-t" style="border-color: var(--surface-border)">
                    <Button label="Paso Anterior" icon="pi pi-arrow-left" severity="secondary" @click="previousStep" />
                    <Button label="Siguiente Paso" icon="pi pi-arrow-right" :disabled="!selectedCobranza" @click="nextStep" />
                </div>
            </div>

            <!-- Paso 5: Confirmar Pago -->
            <div v-if="currentStep === 5" class="step-content">
                <div class="p-6">
                    <!-- Resumen final -->
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold mb-4" style="color: var(--text-color)">Confirmación Final del Pago</h3>

                        <!-- Información del pago -->
                        <div class="confirmation-card mb-6">
                            <div class="confirmation-header">
                                <i class="pi pi-check-circle text-2xl mr-3" style="color: var(--primary-color)"></i>
                                <h4 class="font-semibold text-lg">Detalles del Pago</h4>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <!-- Información del paciente -->
                                <div class="info-section">
                                    <h5 class="font-semibold mb-3" style="color: var(--text-color)">Paciente</h5>
                                    <div class="info-item">
                                        <span class="label">Nombre:</span>
                                        <span class="value">{{ selectedPaciente?.nombre }} {{ selectedPaciente?.apellido }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Identificación:</span>
                                        <span class="value">{{ selectedPaciente?.identificacion }}</span>
                                    </div>
                                </div>

                                <!-- Información del especialista -->
                                <div class="info-section">
                                    <h5 class="font-semibold mb-3" style="color: var(--text-color)">Especialista</h5>
                                    <div class="info-item">
                                        <span class="label">Nombre:</span>
                                        <span class="value">{{ selectedMedico?.nombre }} {{ selectedMedico?.apellido }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Especialidad:</span>
                                        <span class="value">{{ selectedMedico?.especialidad }}</span>
                                    </div>
                                </div>

                                <!-- Información de la proforma -->
                                <div class="info-section">
                                    <h5 class="font-semibold mb-3" style="color: var(--text-color)">Proforma</h5>
                                    <div class="info-item">
                                        <span class="label">Número:</span>
                                        <span class="value">{{ selectedProforma?.numero }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Estado:</span>
                                        <span class="value">{{ selectedProforma?.estado }}</span>
                                    </div>
                                </div>

                                <!-- Información de la cobranza -->
                                <div class="info-section">
                                    <h5 class="font-semibold mb-3" style="color: var(--text-color)">Cobranza Seleccionada</h5>
                                    <div class="info-item">
                                        <span class="label">Fecha:</span>
                                        <span class="value">{{ selectedCobranza?.createdAt ? new Date(selectedCobranza.createdAt).toLocaleDateString() : 'N/A' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Hora:</span>
                                        <span class="value">{{ selectedCobranza?.createdAt ? new Date(selectedCobranza.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Monto:</span>
                                        <span class="value font-semibold" style="color: var(--primary-color)">${{ selectedCobranza?.monto ? selectedCobranza.monto.toFixed(2) : '0.00' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Campo para especificar el monto a pagar al especialista -->
                        <div class="payment-amount-section mb-6">
                            <h4 class="font-semibold mb-4" style="color: var(--text-color)">Monto a Pagar al Especialista</h4>
                            <div class="amount-input-container">
                                <label for="amount" class="block text-sm font-medium mb-2" style="color: var(--text-color)">Cantidad (USD)</label>
                                <div class="input-wrapper">
                                                                        <InputNumber
                                        id="amount"
                                        v-model="montoPago"
                                        :min="0"
                                        :max="999999.99"
                                        :minFractionDigits="2"
                                        :maxFractionDigits="2"
                                        placeholder="Ingrese el monto"
                                        class="w-full"
                                        :class="{ 'p-invalid': montoPago && montoPago <= 0 }"
                                        :useGrouping="false"
                                    />
                                </div>
                                <small v-if="montoPago && montoPago <= 0" class="text-red-500 text-sm mt-1"> El monto debe ser mayor a $0.00 </small>
                                <small v-else class="text-gray-500 text-sm mt-1"> Monto total cobrado: ${{ cobranzas.reduce((total, cobranza) => total + (cobranza.monto || 0), 0).toFixed(2) }} </small>
                            </div>
                        </div>

                        <!-- Campo para la descripción del pago -->
                        <div class="payment-description-section mb-6">
                            <h4 class="font-semibold mb-4" style="color: var(--text-color)">Descripción del Pago</h4>
                            <div class="description-input-container">
                                <label for="description" class="block text-sm font-medium mb-2" style="color: var(--text-color)">Descripción</label>
                                <InputText id="description" v-model="descripcionPago" placeholder="Descripción del pago" class="w-full" />
                                <small class="text-gray-500 text-sm mt-1">Describe el motivo del pago al especialista</small>
                            </div>
                        </div>

                        <!-- Advertencia -->
                        <div class="warning-card">
                            <div class="warning-header">
                                <i class="pi pi-exclamation-triangle text-xl mr-2" style="color: var(--orange-500)"></i>
                                <span class="font-semibold">Importante</span>
                            </div>
                            <p class="mt-2" style="color: var(--text-color-secondary)">Al confirmar este pago, se procesará la transferencia al especialista. Esta acción no se puede deshacer. ¿Está seguro de que desea continuar?</p>
                        </div>
                    </div>
                </div>

                <!-- Botones de navegación -->
                <div class="flex justify-between mt-6 p-6 border-t" style="border-color: var(--surface-border)">
                    <Button label="Paso Anterior" icon="pi pi-arrow-left" severity="secondary" @click="previousStep" />
                    <Button
                        label="Confirmar y Procesar Pago"
                        icon="pi pi-check"
                        :disabled="loadingPago || !montoPago || montoPago <= 0"
                        :loading="loadingPago"
                        @click="procesarPago"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pago-especialista-container {
    @apply p-6 max-w-7xl mx-auto;
}

.header-section {
    @apply mb-8;
}

.header-icon {
    @apply w-16 h-16 rounded-full flex items-center justify-center;
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

.steps-container {
    @apply rounded-lg shadow-sm p-6;
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
}

.step-item {
    @apply flex items-center gap-3;
}

.step-item.active .step-number {
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

.step-item:not(.active) .step-number {
    background-color: var(--surface-border);
    color: var(--text-color-secondary);
}

.step-number {
    @apply w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm;
}

.step-info {
    @apply flex-1;
}

.step-title {
    @apply font-semibold text-sm;
    color: var(--text-color);
}

.step-description {
    @apply text-xs;
    color: var(--text-color-secondary);
}

.step-divider {
    @apply w-12 h-0.5;
    background-color: var(--surface-border);
}

.main-content {
    @apply space-y-6;
}

.step-content {
    @apply rounded-lg shadow-sm;
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
}

.selection-summary {
    @apply rounded-lg shadow-sm p-6;
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
}

.summary-card {
    @apply rounded-lg p-4;
    border: 1px solid var(--primary-color);
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

.summary-card-compact {
    @apply rounded-lg p-2;
    border: 1px solid var(--surface-border);
    background-color: var(--surface-card);
    color: var(--text-color);
}

.summary-header {
    @apply flex items-center mb-3;
}

.summary-content {
    @apply flex items-center justify-between;
}

.patient-info h4 {
    color: var(--primary-contrast-color);
}

.patient-info p {
    color: var(--primary-contrast-color);
    opacity: 0.8;
}

.confirmation-card {
    @apply rounded-lg p-6;
    background-color: var(--surface-section);
    border: 1px solid var(--surface-border);
}

.confirmation-header {
    @apply flex items-center;
    color: var(--text-color);
}

.info-section {
    @apply space-y-2;
}

.info-item {
    @apply flex justify-between items-center py-2;
    border-bottom: 1px solid var(--surface-border);
}

.info-item:last-child {
    border-bottom: none;
}

.info-item .label {
    @apply font-medium;
    color: var(--text-color-secondary);
}

.info-item .value {
    color: var(--text-color);
}

.warning-card {
    @apply rounded-lg p-4;
    background-color: var(--orange-50);
    border: 1px solid var(--orange-200);
}

.warning-header {
    @apply flex items-center;
    color: var(--orange-700);
}

.payment-amount-section {
    @apply rounded-lg p-6;
    background-color: var(--surface-section);
    border: 1px solid var(--surface-border);
}

.amount-input-container {
    @apply space-y-2;
}

.input-wrapper {
    @apply relative flex items-center;
}

.payment-description-section {
    @apply rounded-lg p-6;
    background-color: var(--surface-section);
    border: 1px solid var(--surface-border);
}

.description-input-container {
    @apply space-y-2;
}
</style>
