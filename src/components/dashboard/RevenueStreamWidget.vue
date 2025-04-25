<script setup>
import { useLayout } from '@/layout/composables/layout';
import { GraficaService } from '@/service/GraficaService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';

const toast = useToast();
const citas = ref(null);
const loading = ref(true);
const lineData = ref(null);
const lineOptions = ref(null);

const { getPrimary, getSurface, isDarkTheme } = useLayout();

function setColorOptions(data) {
    if (!data) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    lineData.value = {
        labels: dias,
        datasets: [
            {
                label: 'Semana Actual',
                data: [data.semanaActual.lunes, data.semanaActual.martes, data.semanaActual.miercoles, data.semanaActual.jueves, data.semanaActual.viernes, data.semanaActual.sabado, data.semanaActual.domingo],
                fill: false,
                backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                tension: 0.4
            },
            {
                label: 'Semana Anterior',
                data: [data.semanaAnterior.lunes, data.semanaAnterior.martes, data.semanaAnterior.miercoles, data.semanaAnterior.jueves, data.semanaAnterior.viernes, data.semanaAnterior.sabado, data.semanaAnterior.domingo],
                fill: false,
                backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                borderColor: documentStyle.getPropertyValue('--p-primary-200'),
                tension: 0.4
            }
        ]
    };

    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    fontColor: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary,
                    stepSize: 1
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
}

watch([getPrimary, getSurface, isDarkTheme], () => {
    if (citas.value) {
        setColorOptions(citas.value);
    }
});

onMounted(() => {
    GraficaService.getEstadisticasCitasSemana()
        .then((data) => {
            citas.value = data;
            setColorOptions(data);
        })
        .catch((error) => {
            console.error('Error al cargar las estadísticas de citas:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
});
</script>

<template>
    <div class="col-span-12 xl:col-span-6">
        <div class="card">
            <div class="font-semibold text-xl mb-4">Estadísticas de Citas Semanales</div>
            <div v-if="loading" class="flex justify-center items-center py-8">
                <ProgressSpinner />
            </div>
            <Chart v-else type="line" :data="lineData" :options="lineOptions"></Chart>
        </div>
    </div>
</template>
