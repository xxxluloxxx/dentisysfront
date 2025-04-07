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
const globalFilter = ref(null);
const fechaInicio = ref(null);
const fechaFin = ref(null);
const filtroSeleccionado = ref(null);
const opcionesFiltro = ref([
    { label: 'Todos', value: 'todos' },
    { label: 'Hoy', value: 'hoy' },
    { label: 'Esta semana', value: 'semana' },
    { label: 'Este mes', value: 'mes' },
    { label: 'Personalizado', value: 'personalizado' }
]);
const categorias = ref([
    { id: 1, nombre: 'Ingresos' },
    { id: 2, nombre: 'Gastos Operativos' },
    { id: 3, nombre: 'Gastos de Personal' }
]);

// Propiedades calculadas
const cuentasFiltradas = computed(() => {
    if (!filtroSeleccionado.value || filtroSeleccionado.value.value === 'todos') {
        return cuentas.value;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    inicioMes.setHours(0, 0, 0, 0);

    console.log('Fecha actual:', hoy.toISOString());
    console.log('Filtro seleccionado:', filtroSeleccionado.value.value);

    return cuentas.value.filter((cuenta) => {
        // Aseguramos que la fecha se procese correctamente
        const [year, month, day] = cuenta.fechaMovimiento.split('-').map(Number);
        const fechaCuenta = new Date(year, month - 1, day);
        fechaCuenta.setHours(0, 0, 0, 0);

        console.log('Fecha cuenta:', fechaCuenta.toISOString(), 'Descripción:', cuenta.descripcion);

        if (filtroSeleccionado.value.value === 'hoy') {
            const esHoy = fechaCuenta.getTime() === hoy.getTime();
            console.log('¿Es hoy?:', esHoy, 'Fecha cuenta:', fechaCuenta.toISOString(), 'Fecha hoy:', hoy.toISOString());
            return esHoy;
        } else if (filtroSeleccionado.value.value === 'semana') {
            return fechaCuenta >= inicioSemana && fechaCuenta <= hoy;
        } else if (filtroSeleccionado.value.value === 'mes') {
            return fechaCuenta >= inicioMes && fechaCuenta <= hoy;
        } else if (filtroSeleccionado.value.value === 'personalizado' && fechaInicio.value && fechaFin.value) {
            const inicio = new Date(fechaInicio.value);
            const fin = new Date(fechaFin.value);
            inicio.setHours(0, 0, 0, 0);
            fin.setHours(23, 59, 59, 999);
            return fechaCuenta >= inicio && fechaCuenta <= fin;
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
        descripcion: '',
        estado: true
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
};

const guardarCuenta = async () => {
    // Aquí iría la lógica para guardar la cuenta
    // Por ahora solo cerramos el diálogo
    dialogoCuenta.value = false;
    // En un caso real, llamaríamos a un método del servicio para guardar
    // await CuentasService.saveCuenta(cuenta.value);
    // fetchCuentas();
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
                <div class="flex flex-col">
                    <label class="mb-2 font-medium">Fecha Inicio:</label>
                    <Calendar v-model="fechaInicio" dateFormat="dd/mm/yy" placeholder="Seleccionar fecha" class="w-full" />
                </div>
                <div class="flex flex-col">
                    <label class="mb-2 font-medium">Fecha Fin:</label>
                    <Calendar v-model="fechaFin" dateFormat="dd/mm/yy" placeholder="Seleccionar fecha" class="w-full" />
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
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                :globalFilterFields="['descripcion', 'categoriaNombre']"
                :globalFilter="globalFilter"
                emptyMessage="No se encontraron registros"
            >
                <template #header>
                    <div class="flex justify-between items-center">
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="globalFilter" placeholder="Buscar..." class="p-inputtext-sm" />
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
                <Column field="estado" header="Estado" sortable>
                    <template #body="slotProps">
                        <span
                            class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                            :class="slotProps.data.estado ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                        >
                            {{ slotProps.data.estado ? 'Activo' : 'Inactivo' }}
                        </span>
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
        <Dialog v-model:visible="dialogoCuenta" :style="{ width: '450px' }" header="Detalles de Cuenta" :modal="true" class="p-fluid">
            <div class="field">
                <label for="categoria">Categoría</label>
                <Dropdown id="categoria" v-model="cuenta.categoriaId" :options="categorias" optionLabel="nombre" optionValue="id" placeholder="Seleccionar categoría" />
            </div>
            <div class="field">
                <label for="fecha">Fecha de Movimiento</label>
                <Calendar id="fecha" v-model="cuenta.fechaMovimiento" dateFormat="dd/mm/yy" />
            </div>
            <div class="field">
                <label for="monto">Monto</label>
                <InputNumber id="monto" v-model="cuenta.monto" mode="currency" currency="USD" locale="en-US" />
            </div>
            <div class="field">
                <label for="descripcion">Descripción</label>
                <InputText id="descripcion" v-model="cuenta.descripcion" required autofocus />
            </div>
            <div class="field">
                <label for="estado">Estado</label>
                <InputSwitch id="estado" v-model="cuenta.estado" />
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cerrarDialogo" />
                <Button label="Guardar" icon="pi pi-check" class="p-button-text" @click="guardarCuenta" />
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
</style>
