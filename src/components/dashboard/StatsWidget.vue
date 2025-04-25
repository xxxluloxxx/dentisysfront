<script setup>
import { GraficaService } from '@/service/GraficaService';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const estadisticas = ref({});
const loading = ref(true);

const porcentajeCambio = computed(() => {
    if (!estadisticas.value.cantidadProformasMesAnterior) return 100;
    return ((estadisticas.value.cantidadProformas - estadisticas.value.cantidadProformasMesAnterior) / estadisticas.value.cantidadProformasMesAnterior) * 100;
});

onMounted(() => {
    GraficaService.getEstadisticasGenerales()
        .then((data) => (estadisticas.value = data))
        .catch((error) => {
            console.error('Error al cargar los pacientes:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });

    console.log(estadisticas.value);
});
</script>

<template>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div v-if="loading">
                <Skeleton height="2rem" class="mb-4" />
                <Skeleton height="1.5rem" width="60%" />
            </div>
            <div v-else>
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Citas</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ estadisticas.cantidadCitasHoy }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ estadisticas.cantidadCitasAyer }} nuevas </span>
                <span class="text-muted-color">desde ayer</span>
            </div>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div v-if="loading">
                <Skeleton height="2rem" class="mb-4" />
                <Skeleton height="1.5rem" width="60%" />
            </div>
            <div v-else>
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Proformas</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ estadisticas.cantidadProformas }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-file-edit text-orange-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ porcentajeCambio.toFixed(0) }}% </span>
                <span class="text-muted-color">desde el mes anterior</span>
            </div>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div v-if="loading">
                <Skeleton height="2rem" class="mb-4" />
                <Skeleton height="1.5rem" width="60%" />
            </div>
            <div v-else>
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Pacientes</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ estadisticas.totalPacientes }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ estadisticas.pacientesNuevosMesActual }} </span>
                <span class="text-muted-color"> nuevos este mes</span>
            </div>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div v-if="loading">
                <Skeleton height="2rem" class="mb-4" />
                <Skeleton height="1.5rem" width="60%" />
            </div>
            <div v-else>
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Fichas médicas</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ estadisticas.cantidadFichasEstaSemana }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-file text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ estadisticas.cantidadFichasSemanaAnterior }} </span>
                <span class="text-muted-color"> de la semana pasada</span>
            </div>
        </div>
    </div>
</template>
