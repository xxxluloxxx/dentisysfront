<script setup>
import { CuentasService } from '@/service/CuentasService';
import Chart from 'primevue/chart';
import { computed, onMounted, ref } from 'vue';

// Referencias para los componentes de la interfaz
const cuentas = ref([]);
const cuenta = ref({});
const dialogoCuenta = ref(false);
const dialogoEliminar = ref(false);
const selectedCuentas = ref(null);
const loading = ref(false);
const guardando = ref(false);
const formSubmitted = ref(false);
const fechaInicio = ref(null);
const fechaFin = ref(null);
const filtroSeleccionado = ref(null);
const opcionesFiltro = ref([
    { label: 'Todos', value: 'todos' },
    { label: 'Hoy', value: 'hoy' },
    { label: 'Esta semana', value: 'semana' },
    { label: 'Este mes', value: 'mes' }
]);
const categorias = ref([
    { id: 1, nombre: 'Ingresos' },
    { id: 2, nombre: 'Gastos Operativos' },
    { id: 3, nombre: 'Gastos de Personal' }
]);
const filters = ref({
    global: { value: null, matchMode: 'contains' }
});

// Propiedades calculadas
const cuentasFiltradas = computed(() => {
    if (!filtroSeleccionado.value || filtroSeleccionado.value.value === 'todos') {
        return cuentas.value;
    }

    const hoy = new Date();
    const hoyString = hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const inicioSemanaString = inicioSemana.toISOString().split('T')[0];

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioMesString = inicioMes.toISOString().split('T')[0];

    return cuentas.value.filter((cuenta) => {
        // Comparar directamente las fechas en formato string YYYY-MM-DD
        const fechaCuentaString = cuenta.fechaMovimiento;

        if (filtroSeleccionado.value.value === 'hoy') {
            return fechaCuentaString === hoyString;
        } else if (filtroSeleccionado.value.value === 'semana') {
            return fechaCuentaString >= inicioSemanaString && fechaCuentaString <= hoyString;
        } else if (filtroSeleccionado.value.value === 'mes') {
            return fechaCuentaString >= inicioMesString && fechaCuentaString <= hoyString;
        } else if (filtroSeleccionado.value.value === 'personalizado' && fechaInicio.value && fechaFin.value) {
            const inicio = new Date(fechaInicio.value);
            const fin = new Date(fechaFin.value);
            const inicioString = inicio.toISOString().split('T')[0];
            const finString = fin.toISOString().split('T')[0];
            return fechaCuentaString >= inicioString && fechaCuentaString <= finString;
        }

        return true;
    });
});

const totalIngresos = computed(() => {
    return cuentasFiltradas.value.filter((c) => c.categoriaNombre === 'Ingresos').reduce((sum, c) => sum + c.monto, 0);
});

const totalGastos = computed(() => {
    return cuentasFiltradas.value.filter((c) => c.categoriaNombre !== 'Ingresos').reduce((sum, c) => sum + c.monto, 0);
});

const balance = computed(() => {
    return totalIngresos.value - totalGastos.value;
});

const isDarkMode = computed(() => {
    return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
});

const chartData = computed(() => {
    return {
        labels: ['Ingresos', 'Gastos'],
        datasets: [
            {
                label: 'Monto ($)',
                data: [totalIngresos.value, totalGastos.value],
                backgroundColor: [isDarkMode.value ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.6)', isDarkMode.value ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.6)'],
                borderColor: [isDarkMode.value ? 'rgba(34, 197, 94, 0.9)' : 'rgba(34, 197, 94, 1)', isDarkMode.value ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 1)'],
                borderWidth: 1
            }
        ]
    };
});

const chartOptions = computed(() => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: isDarkMode.value ? '#f3f4f6' : '#374151',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                backgroundColor: isDarkMode.value ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                titleColor: isDarkMode.value ? '#f3f4f6' : '#374151',
                bodyColor: isDarkMode.value ? '#f3f4f6' : '#374151',
                borderColor: isDarkMode.value ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)',
                borderWidth: 1,
                titleFont: {
                    weight: 'bold'
                },
                bodyFont: {
                    weight: 'bold'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: isDarkMode.value ? '#f3f4f6' : '#374151',
                    font: {
                        weight: 'bold'
                    },
                    callback: function (value) {
                        return '$' + value.toFixed(2);
                    }
                },
                grid: {
                    color: isDarkMode.value ? 'rgba(75, 85, 99, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: isDarkMode.value ? '#f3f4f6' : '#374151',
                    font: {
                        weight: 'bold'
                    }
                },
                grid: {
                    color: isDarkMode.value ? 'rgba(75, 85, 99, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                }
            }
        }
    };
});

const pieChartData = computed(() => {
    const gastosOperativos = cuentasFiltradas.value.filter((c) => c.categoriaNombre === 'Gastos Operativos').reduce((sum, c) => sum + c.monto, 0);

    const gastosPersonal = cuentasFiltradas.value.filter((c) => c.categoriaNombre === 'Gastos de Personal').reduce((sum, c) => sum + c.monto, 0);

    return {
        labels: ['Ingresos', 'Gastos Operativos', 'Gastos de Personal'],
        datasets: [
            {
                data: [totalIngresos.value, gastosOperativos, gastosPersonal],
                backgroundColor: [isDarkMode.value ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.6)', isDarkMode.value ? 'rgba(234, 179, 8, 0.5)' : 'rgba(234, 179, 8, 0.6)', isDarkMode.value ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.6)'],
                borderColor: [isDarkMode.value ? 'rgba(34, 197, 94, 0.9)' : 'rgba(34, 197, 94, 1)', isDarkMode.value ? 'rgba(234, 179, 8, 0.9)' : 'rgba(234, 179, 8, 1)', isDarkMode.value ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 1)'],
                borderWidth: 1
            }
        ]
    };
});

const pieChartOptions = computed(() => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: isDarkMode.value ? '#f3f4f6' : '#374151',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                backgroundColor: isDarkMode.value ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                titleColor: isDarkMode.value ? '#f3f4f6' : '#374151',
                bodyColor: isDarkMode.value ? '#f3f4f6' : '#374151',
                borderColor: isDarkMode.value ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)',
                borderWidth: 1,
                titleFont: {
                    weight: 'bold'
                },
                bodyFont: {
                    weight: 'bold'
                }
            }
        }
    };
});

// Métodos
const fetchCuentas = async () => {
    loading.value = true;
    try {
        cuentas.value = await CuentasService.getAll();
    } catch (error) {
        console.error('Error al cargar las cuentas:', error);
    } finally {
        loading.value = false;
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getCategoriaClass = (categoria) => {
    const classes = {
        Ingresos: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-50',
        'Gastos Operativos': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-50',
        'Gastos de Personal': 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-50'
    };
    return classes[categoria] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
};

const openNewDialog = () => {
    cuenta.value = {
        categoriaId: null,
        fechaMovimiento: new Date(),
        monto: 0,
        descripcion: ''
    };
    dialogoCuenta.value = true;
};

const editarCuenta = (cuentaItem) => {
    cuenta.value = { ...cuentaItem };
    dialogoCuenta.value = true;
};

const cerrarDialogo = () => {
    dialogoCuenta.value = false;
    cuenta.value = {};
    formSubmitted.value = false;
    guardando.value = false;
};

const guardarCuenta = async () => {
    formSubmitted.value = true;

    // Validar campos requeridos
    if (!cuenta.value.categoriaId || !cuenta.value.fechaMovimiento || !cuenta.value.monto || cuenta.value.monto <= 0 || !cuenta.value.descripcion) {
        return;
    }

    guardando.value = true;
    try {
        const cuentaData = {
            descripcion: cuenta.value.descripcion,
            monto: cuenta.value.monto,
            fechaMovimiento: cuenta.value.fechaMovimiento,
            categoriaId: cuenta.value.categoriaId,
            cobranzaId: null // Valor fijo por ahora
        };

        if (cuenta.value.id) {
            // Actualizar cuenta existente
            await CuentasService.update(cuenta.value.id, cuentaData);
        } else {
            // Crear nueva cuenta
            await CuentasService.create(cuentaData);
        }

        await fetchCuentas(); // Recargar la lista de cuentas
        cerrarDialogo();

        // Mostrar mensaje de éxito
        // Aquí podrías usar un toast o notificación
        console.log('Registro guardado exitosamente');
    } catch (error) {
        console.error('Error al guardar la cuenta:', error);
        // Aquí podrías mostrar un mensaje de error
    } finally {
        guardando.value = false;
    }
};

const limpiarFormulario = () => {
    cuenta.value = {
        categoriaId: null,
        fechaMovimiento: new Date(),
        monto: 0,
        descripcion: ''
    };
    formSubmitted.value = false;
};

const confirmarEliminar = (cuentaItem) => {
    cuenta.value = cuentaItem;
    dialogoEliminar.value = true;
};

const confirmarEliminarSeleccionados = () => {
    cuenta.value = null;
    dialogoEliminar.value = true;
};

const eliminarCuenta = async () => {
    // Aquí iría la lógica para eliminar la cuenta
    // Por ahora solo cerramos el diálogo
    dialogoEliminar.value = false;
    // En un caso real, llamaríamos a un método del servicio para eliminar
    // if (cuenta.value) {
    //   await CuentasService.deleteCuenta(cuenta.value.id);
    // } else if (selectedCuentas.value) {
    //   await CuentasService.deleteCuentas(selectedCuentas.value.map(c => c.id));
    // }
    // fetchCuentas();
};

const aplicarFiltro = () => {
    // El filtrado se aplica automáticamente a través del computed property
    // Solo necesitamos asegurarnos de que los datos se actualicen
    fetchCuentas();
};

// Carga inicial de datos al montar el componente
onMounted(() => {
    fetchCuentas();
});
</script>

<template>
    <div class="cuenta-container">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Gestión de Cuentas</h1>
            <div class="flex gap-2">
                <Button icon="pi pi-plus" label="Nuevo Registro" class="p-button-success" @click="openNewDialog" />
            </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="flex flex-col">
                    <label class="mb-2 font-medium">Filtrar por:</label>
                    <Dropdown v-model="filtroSeleccionado" :options="opcionesFiltro" optionLabel="label" placeholder="Seleccionar filtro" class="w-full" />
                </div>

                <div class="flex flex-col justify-end">
                    <Button label="Aplicar Filtro" icon="pi pi-filter" class="p-button-primary w-full" @click="aplicarFiltro" />
                </div>
            </div>
        </div>

        <!-- Resumen de cuentas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-green-100 dark:bg-green-800 p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-green-800 dark:text-green-50">Ingresos Totales</h3>
                <p class="text-2xl font-bold text-green-600 dark:text-green-200">${{ totalIngresos.toFixed(2) }}</p>
            </div>
            <div class="bg-red-100 dark:bg-red-800 p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-red-800 dark:text-red-50">Gastos Totales</h3>
                <p class="text-2xl font-bold text-red-600 dark:text-red-200">${{ totalGastos.toFixed(2) }}</p>
            </div>
            <div class="bg-blue-100 dark:bg-blue-800 p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-50">Balance</h3>
                <p class="text-2xl font-bold" :class="balance >= 0 ? 'text-blue-600 dark:text-blue-200' : 'text-red-600 dark:text-red-200'">${{ balance.toFixed(2) }}</p>
            </div>
        </div>

        <!-- Gráfica de ingresos y egresos -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-50">Resumen Financiero</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 class="text-lg font-medium mb-2 text-gray-700 dark:text-gray-100">Ingresos vs Gastos</h3>
                    <Chart type="bar" :data="chartData" :options="chartOptions" />
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-2 text-gray-700 dark:text-gray-100">Distribución por Categoría</h3>
                    <Chart type="pie" :data="pieChartData" :options="pieChartOptions" />
                </div>
            </div>
        </div>

        <!-- Tabla de movimientos -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <DataTable
                :value="cuentasFiltradas"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                responsiveLayout="scroll"
                class="p-datatable-sm"
                v-model:selection="selectedCuentas"
                dataKey="id"
                :loading="loading"
                stripedRows
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                :globalFilterFields="['descripcion', 'categoriaNombre']"
                emptyMessage="No se encontraron registros"
                :sortField="'fechaMovimiento'"
                :sortOrder="-1"
                :defaultSortOrder="1"
                sortMode="single"
            >
                <template #header>
                    <div class="flex justify-between items-center">
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." class="p-inputtext-sm" />
                        </span>
                        <div class="flex gap-2">
                            <Button icon="pi pi-trash" class="p-button-danger p-button-sm" @click="confirmarEliminarSeleccionados" :disabled="!selectedCuentas || selectedCuentas.length === 0" />
                        </div>
                    </div>
                </template>

                <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                <Column field="fechaMovimiento" header="Fecha" sortable>
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.fechaMovimiento) }}
                    </template>
                </Column>
                <Column field="categoriaNombre" header="Categoría" sortable>
                    <template #body="slotProps">
                        <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getCategoriaClass(slotProps.data.categoriaNombre)">
                            {{ slotProps.data.categoriaNombre }}
                        </span>
                    </template>
                </Column>
                <Column field="descripcion" header="Descripción" sortable></Column>
                <Column field="monto" header="Monto" sortable>
                    <template #body="slotProps">
                        <span :class="slotProps.data.categoriaNombre === 'Ingresos' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"> ${{ slotProps.data.monto.toFixed(2) }} </span>
                    </template>
                </Column>
                <Column header="Acciones" :exportable="false" style="min-width: 8rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-sm mr-2" @click="editarCuenta(slotProps.data)" />
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="confirmarEliminar(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Diálogo para crear/editar cuenta -->
        <Dialog v-model:visible="dialogoCuenta" :style="{ width: '600px' }" :header="cuenta.id ? 'Editar Registro' : 'Nuevo Registro'" :modal="true" class="p-fluid cuenta-dialog" :closable="false">
            <div class="dialog-content">
                <!-- Header con icono -->
                <div class="dialog-header mb-4">
                    <div class="flex items-center justify-center mb-3">
                        <div class="icon-container">
                            <i class="pi pi-wallet text-2xl"></i>
                        </div>
                    </div>
                    <h2 class="text-xl font-bold text-center text-gray-800 dark:text-gray-100">
                        {{ cuenta.id ? 'Editar Registro de Cuenta' : 'Nuevo Registro de Cuenta' }}
                    </h2>
                    <p class="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">Complete los campos para {{ cuenta.id ? 'actualizar' : 'crear' }} el registro</p>
                </div>

                <!-- Formulario -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Categoría -->
                    <div class="field">
                        <label for="categoria" class="field-label">
                            <i class="pi pi-tag mr-2"></i>
                            Categoría *
                        </label>
                        <Dropdown
                            id="categoria"
                            v-model="cuenta.categoriaId"
                            :options="categorias"
                            optionLabel="nombre"
                            optionValue="id"
                            placeholder="Seleccionar categoría"
                            class="w-full"
                            :class="{ 'p-invalid': !cuenta.categoriaId && formSubmitted }"
                        />
                        <small v-if="!cuenta.categoriaId && formSubmitted" class="p-error">La categoría es requerida</small>
                    </div>

                    <!-- Fecha -->
                    <div class="field">
                        <label for="fecha" class="field-label">
                            <i class="pi pi-calendar mr-2"></i>
                            Fecha de Movimiento *
                        </label>
                        <Calendar id="fecha" v-model="cuenta.fechaMovimiento" dateFormat="dd/mm/yy" class="w-full" :class="{ 'p-invalid': !cuenta.fechaMovimiento && formSubmitted }" :maxDate="new Date()" />
                        <small v-if="!cuenta.fechaMovimiento && formSubmitted" class="p-error">La fecha es requerida</small>
                    </div>
                </div>

                <!-- Monto -->
                <div class="field mt-4">
                    <label for="monto" class="field-label">
                        <i class="pi pi-dollar mr-2"></i>
                        Monto *
                    </label>
                    <div class="relative">
                        <InputNumber id="monto" v-model="cuenta.monto" mode="currency" currency="USD" locale="en-US" class="w-full" :class="{ 'p-invalid': (!cuenta.monto || cuenta.monto <= 0) && formSubmitted }" placeholder="0.00" />
                        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            <i class="pi pi-dollar"></i>
                        </div>
                    </div>
                    <small v-if="(!cuenta.monto || cuenta.monto <= 0) && formSubmitted" class="p-error">El monto debe ser mayor a 0</small>
                </div>

                <!-- Descripción -->
                <div class="field mt-4">
                    <label for="descripcion" class="field-label">
                        <i class="pi pi-file-edit mr-2"></i>
                        Descripción *
                    </label>
                    <Textarea id="descripcion" v-model="cuenta.descripcion" rows="3" placeholder="Ingrese una descripción detallada del movimiento..." class="w-full" :class="{ 'p-invalid': !cuenta.descripcion && formSubmitted }" autoResize />
                    <small v-if="!cuenta.descripcion && formSubmitted" class="p-error">La descripción es requerida</small>
                    <small class="text-gray-500">{{ cuenta.descripcion ? cuenta.descripcion.length : 0 }}/500 caracteres</small>
                </div>

                <!-- Información adicional -->
                <div class="info-section mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div class="flex items-start">
                        <i class="pi pi-info-circle text-blue-500 mt-1 mr-2"></i>
                        <div>
                            <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200">Información</h4>
                            <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">Los campos marcados con * son obligatorios. El registro se guardará automáticamente en la categoría seleccionada.</p>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between items-center w-full">
                    <Button label="Cancelar" icon="pi pi-times" class="p-button-outlined p-button-secondary" @click="cerrarDialogo" />
                    <div class="flex gap-2">
                        <Button label="Limpiar" icon="pi pi-refresh" class="p-button-outlined p-button-info" @click="limpiarFormulario" />
                        <Button :label="cuenta.id ? 'Actualizar' : 'Guardar'" icon="pi pi-check" class="p-button-success" @click="guardarCuenta" :loading="guardando" />
                    </div>
                </div>
            </template>
        </Dialog>

        <!-- Diálogo de confirmación para eliminar -->
        <Dialog v-model:visible="dialogoEliminar" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="cuenta"
                    >¿Está seguro de eliminar el registro <b>{{ cuenta.descripcion }}</b
                    >?</span
                >
                <span v-else>¿Está seguro de eliminar los registros seleccionados?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" class="p-button-text" @click="dialogoEliminar = false" />
                <Button label="Sí" icon="pi pi-check" class="p-button-text p-button-danger" @click="eliminarCuenta" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.cuenta-container {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
}

@media (max-width: 768px) {
    .cuenta-container {
        padding: 1rem;
    }
}

:deep(.p-datatable) {
    background-color: var(--surface-card);
}

:deep(.p-datatable .p-datatable-header) {
    background-color: var(--surface-section);
    border-color: var(--surface-border);
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: var(--surface-section);
    color: var(--text-color);
    border-color: var(--surface-border);
}

:deep(.p-datatable .p-datatable-tbody > tr) {
    background-color: var(--surface-card);
    color: var(--text-color);
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
    background-color: var(--surface-hover);
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: var(--surface-hover);
}

:deep(.p-dialog) {
    background-color: var(--surface-card);
}

:deep(.p-dialog .p-dialog-header) {
    background-color: var(--surface-section);
    color: var(--text-color);
}

:deep(.p-dialog .p-dialog-content) {
    background-color: var(--surface-card);
    color: var(--text-color);
}

:deep(.p-dialog .p-dialog-footer) {
    background-color: var(--surface-section);
    border-top: 1px solid var(--surface-border);
}

/* Estilos para el diálogo mejorado */
.cuenta-dialog {
    border-radius: 12px;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dialog-content {
    padding: 0;
}

.dialog-header {
    text-align: center;
}

.icon-container {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin: 0 auto;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.field-label {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
}

.field-label i {
    color: #667eea;
}

.info-section {
    border-left: 4px solid #3b82f6;
}

/* Estilos para campos con error */
:deep(.p-invalid) {
    border-color: #ef4444 !important;
}

:deep(.p-error) {
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    display: block;
}

/* Estilos para el textarea */
:deep(.p-textarea) {
    font-family: inherit;
}

/* Estilos para el dropdown */
:deep(.p-dropdown) {
    width: 100%;
}

/* Estilos para el calendar */
:deep(.p-calendar) {
    width: 100%;
}

/* Estilos para el input number */
:deep(.p-inputnumber) {
    width: 100%;
}

/* Animaciones */
.cuenta-dialog {
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 640px) {
    .cuenta-dialog {
        width: 95% !important;
        margin: 1rem;
    }

    .dialog-content {
        padding: 0;
    }
}
</style>
