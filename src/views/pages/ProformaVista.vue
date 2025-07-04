<script setup>
import { BancoService } from '@/service/BancoService';
import { CobranzaService } from '@/service/CobranzaService';
import { ProformaService } from '@/service/ProformaService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const proforma = ref(null);
const loading = ref(true);
const showDialogCobranza = ref(false);
const multiple = ref('multiple');
const bancos = ref([]);
const nuevaCobranza = ref({
    monto: null,
    metodoPago: null,
    banco: null,
    observaciones: '',
    fechaPago: new Date().toLocaleString('en-CA', { timeZone: 'America/Guayaquil' }).split(',')[0],
    estado: 'PARCIAL'
});

onMounted(async () => {
    try {
        const proformaId = route.params.id;
        if (!proformaId) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'ID de proforma no válido', life: 3000 });
            router.push('/pages/proformas');
            return;
        }

        const data = await ProformaService.getById(proformaId);
        proforma.value = data;

        // Cargar bancos
        await cargarBancos();
    } catch (error) {
        console.error('Error al cargar la proforma:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar la proforma', life: 3000 });
        router.push('/pages/proformas');
    } finally {
        loading.value = false;
    }
});

async function cargarBancos() {
    try {
        const data = await BancoService.getAll();
        bancos.value = data;
    } catch (error) {
        console.error('Error al cargar bancos:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los bancos', life: 3000 });
    }
}

function formatCurrency(value) {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return;
}

function obtenerFecha(value) {
    if (value) {
        const fecha = new Date(value);
        return fecha.toISOString().split('T')[0];
    }
    return '';
}

function getEstadoSeverityProforma(estado) {
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

function getEstadoSeverity(estado) {
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
}

function getEstadoSeverityMetodoPago(estado) {
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
}

const calcularTotalPagado = () => {
    if (!proforma.value || !proforma.value.cobranzas) return 0;
    return proforma.value.cobranzas.reduce((total, cobranza) => total + cobranza.monto, 0);
};

const agregarCobranza = () => {
    if (!nuevaCobranza.value.monto || !nuevaCobranza.value.metodoPago) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor complete todos los campos requeridos', life: 3000 });
        return;
    }

    // Validar que se seleccione un banco si el método de pago es TRANSFERENCIA
    if (nuevaCobranza.value.metodoPago === 'TRANSFERENCIA' && !nuevaCobranza.value.banco) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor seleccione un banco para la transferencia', life: 3000 });
        return;
    }

    const cobranzaData = {
        proforma: {
            id: proforma.value.id
        },
        fechaPago: nuevaCobranza.value.fechaPago,
        monto: nuevaCobranza.value.monto,
        metodoPago: nuevaCobranza.value.metodoPago,
        banco: nuevaCobranza.value.banco ? { id: nuevaCobranza.value.banco } : null,
        estado: nuevaCobranza.value.estado,
        observaciones: nuevaCobranza.value.observaciones
    };

    CobranzaService.create(cobranzaData)
        .then(() => {
            return ProformaService.getById(proforma.value.id);
        })
        .then((data) => {
            proforma.value = data;
            showDialogCobranza.value = false;
            nuevaCobranza.value = {
                monto: null,
                metodoPago: null,
                banco: null,
                observaciones: '',
                fechaPago: new Date().toLocaleString('en-CA', { timeZone: 'America/Guayaquil' }).split(',')[0],
                estado: 'PARCIAL'
            };
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Cobranza agregada correctamente', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al agregar la cobranza:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al agregar la cobranza', life: 3000 });
        });
};

const limpiarCamposCobranza = () => {
    nuevaCobranza.value = {
        monto: null,
        metodoPago: null,
        banco: null,
        observaciones: '',
        fechaPago: new Date().toLocaleString('en-CA', { timeZone: 'America/Guayaquil' }).split(',')[0],
        estado: 'PARCIAL'
    };
};

// Watcher para el método de pago
watch(
    () => nuevaCobranza.value.metodoPago,
    (newValue) => {
        console.log('Método de pago cambiado a:', newValue);
        if (newValue !== 'TRANSFERENCIA') {
            nuevaCobranza.value.banco = null;
        }
    }
);
</script>

<template>
    <div class="card">
        <div v-if="loading" class="flex justify-center items-center h-64">
            <i class="pi pi-spin pi-spinner text-4xl"></i>
        </div>
        <div v-else-if="proforma" class="p-4">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Detalles de la Proforma</h2>
                <Button icon="pi pi-arrow-left" label="Volver" @click="router.push('/pages/proformas')" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 class="text-xl font-semibold mb-4">Información General</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="font-semibold">Médico:</p>
                            <p>{{ proforma.medicoNombre }}</p>
                        </div>
                        <div>
                            <p class="font-semibold">Paciente:</p>
                            <p>{{ proforma.pacienteNombre }}</p>
                        </div>
                        <div>
                            <p class="font-semibold">Fecha:</p>
                            <p>{{ obtenerFecha(proforma.createdAt) }}</p>
                        </div>
                        <div>
                            <p class="font-semibold">Estado:</p>
                            <Tag :value="proforma.estado" :severity="getEstadoSeverityProforma(proforma.estado)" />
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 class="text-xl font-semibold mb-4">Información Financiera</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="font-semibold">Subtotal:</p>
                            <p>{{ formatCurrency(proforma.subtotal) }}</p>
                        </div>
                        <div>
                            <p class="font-semibold">IVA ({{ proforma.iva }}%):</p>
                            <p>{{ formatCurrency(proforma.subtotal * (proforma.iva / 100)) }}</p>
                        </div>
                        <div>
                            <p class="font-semibold">Total:</p>
                            <p class="text-xl font-bold">{{ formatCurrency(proforma.total) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 class="text-xl font-semibold mb-4">Productos</h3>
                <DataTable :value="proforma.detalles" class="p-datatable-sm">
                    <Column field="productoNombre" header="Producto"></Column>
                    <Column field="precioUnitario" header="Precio Unitario">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.precioUnitario) }}
                        </template>
                    </Column>
                    <Column field="cantidad" header="Cantidad"></Column>
                    <Column field="subtotal" header="Subtotal">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.subtotal) }}
                        </template>
                    </Column>
                </DataTable>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Cobranzas</h3>
                    <Button icon="pi pi-plus" label="Agregar Cobranza" @click="showDialogCobranza = true" />
                </div>
                <DataTable
                    :value="proforma.cobranzas"
                    class="p-datatable-sm"
                    :sortMode="multiple"
                    :multiSortMeta="[
                        { field: 'fechaPago', order: 1 },
                        { field: 'monto', order: 1 }
                    ]"
                >
                    <Column field="fechaPago" header="Fecha de Pago">
                        <template #body="slotProps">
                            {{ obtenerFecha(slotProps.data.fechaPago) }}
                        </template>
                    </Column>
                    <Column field="monto" header="Monto">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.monto) }}
                        </template>
                    </Column>
                    <Column field="metodoPago" header="Método de Pago">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.metodoPago" :severity="getEstadoSeverityMetodoPago(slotProps.data.metodoPago)" />
                        </template>
                    </Column>
                    <Column field="estado" header="Estado">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.estado" :severity="getEstadoSeverity(slotProps.data.estado)" />
                        </template>
                    </Column>
                    <Column field="observaciones" header="Observaciones"></Column>
                </DataTable>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
                <h3 class="text-xl font-semibold mb-4">Resumen Financiero</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p class="font-semibold text-lg">Total Proforma</p>
                        <p class="text-2xl font-bold text-primary">{{ formatCurrency(proforma.total) }}</p>
                    </div>
                    <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p class="font-semibold text-lg">Total Pagado</p>
                        <p class="text-2xl font-bold text-yellow-500">{{ formatCurrency(calcularTotalPagado()) }}</p>
                    </div>
                    <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p class="font-semibold text-lg">Faltante</p>
                        <p class="text-2xl font-bold text-red-500">{{ formatCurrency(proforma.total - calcularTotalPagado()) }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="text-center p-4">
            <p class="text-xl">No se encontró la proforma</p>
            <Button label="Volver" class="mt-4" @click="router.push('/pages/proformas')" />
        </div>
    </div>

    <Dialog v-model:visible="showDialogCobranza" header="Nueva Cobranza" :modal="true" class="p-fluid" :style="{ width: '500px' }" @hide="limpiarCamposCobranza">
        <div class="grid grid-cols-1 gap-4">
            <div class="field">
                <label for="monto" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monto *</label>
                <InputNumber id="monto" v-model="nuevaCobranza.monto" mode="currency" currency="USD" locale="en-US" class="w-full" placeholder="0.00" />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="field">
                    <label for="metodoPago" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Método de Pago *</label>
                    <Dropdown id="metodoPago" v-model="nuevaCobranza.metodoPago" :options="['EFECTIVO', 'TRANSFERENCIA', 'TARJETA']" placeholder="Seleccione método" class="w-full" />
                </div>

                <div class="field">
                    <label for="estado" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                    <Dropdown id="estado" v-model="nuevaCobranza.estado" :options="['COMPLETADO', 'PARCIAL']" placeholder="Seleccione estado" class="w-full" />
                </div>
            </div>

            <!-- Campo de banco que aparece solo cuando se selecciona TRANSFERENCIA -->
            <div v-if="nuevaCobranza.metodoPago === 'TRANSFERENCIA'" class="field">
                <label for="banco" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banco *</label>
                <Dropdown id="banco" v-model="nuevaCobranza.banco" :options="bancos" optionLabel="nombreCuenta" optionValue="id" placeholder="Seleccione un banco" class="w-full">
                    <template #option="slotProps">
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 rounded-full border border-gray-300" :style="{ backgroundColor: slotProps.option.color || '#007bff' }"></div>
                            <span>{{ slotProps.option.nombreCuenta }}</span>
                        </div>
                    </template>
                    <template #value="slotProps">
                        <div v-if="slotProps.value" class="flex items-center gap-2">
                            <div class="w-4 h-4 rounded-full border border-gray-300" :style="{ backgroundColor: bancos.find((b) => b.id === slotProps.value)?.color || '#007bff' }"></div>
                            <span>{{ bancos.find((b) => b.id === slotProps.value)?.nombreCuenta }}</span>
                        </div>
                        <span v-else>{{ slotProps.placeholder }}</span>
                    </template>
                </Dropdown>
            </div>

            <div class="field">
                <label for="fechaPago" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Pago</label>
                <Calendar id="fechaPago" v-model="nuevaCobranza.fechaPago" dateFormat="yy-mm-dd" class="w-full" placeholder="Seleccione fecha" />
            </div>

            <div class="field">
                <label for="observaciones" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observaciones</label>
                <Textarea id="observaciones" v-model="nuevaCobranza.observaciones" rows="3" class="w-full" placeholder="Ingrese observaciones adicionales..." />
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button label="Cancelar" icon="pi pi-times" @click="showDialogCobranza = false" class="p-button-text" />
                <Button label="Guardar Cobranza" icon="pi pi-check" @click="agregarCobranza" class="p-button-success" />
            </div>
        </template>
    </Dialog>
</template>
