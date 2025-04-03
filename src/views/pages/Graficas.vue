<script setup>
import { useLayout } from '@/layout/composables/layout';
import { CitaService } from '@/service/CitaService';
import { GraficaService } from '@/service/GraficaService';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const pieOptions = ref(null);
const toast = useToast();
const eventos = ref([]);
const dataCircular = ref();
const dataPie = ref();

const opcionesCalendario = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    locale: 'es',
    slotMinTime: '08:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: false,
    height: '600px',
    events: eventos,
    eventContent: (arg) => {
        const horaInicio = arg.event.start ? new Date(arg.event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
        const horaFin = arg.event.end ? new Date(arg.event.end).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
        return {
            html: `
                <div class="fc-event-main-frame">
                    <div class="fc-event-time">${horaInicio} - ${horaFin}</div>
                    <div class="fc-event-title">${arg.event.title}</div>
                    ${arg.event.extendedProps.subtitle ? `<div class="fc-event-subtitle">${arg.event.extendedProps.subtitle}</div>` : ''}
                </div>
            `
        };
    },
    eventClick: (info) => {
        toast.add({
            severity: 'info',
            summary: info.event.title,
            detail: info.event.extendedProps.description,
            life: 3000
        });
    },
    eventDidMount: (info) => {
        info.el.title = info.event.extendedProps.description;
    }
};

function transformarDatosCircular(datos) {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['Pendientes', 'Canceladas', 'Pagadas'],
        datasets: [
            {
                data: [datos.cantidadPendientes, datos.cantidadCanceladas, datos.cantidadPagadas],
                backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--p-indigo-400'), documentStyle.getPropertyValue('--p-purple-400'), documentStyle.getPropertyValue('--p-teal-400')]
            }
        ]
    };
}

function transformarDatosPie(datos) {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['Pendientes', 'Canceladas', 'Pagadas'],
        datasets: [
            {
                data: [datos.totalPendientes, datos.totalCanceladas, datos.totalPagadas],
                backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--p-indigo-400'), documentStyle.getPropertyValue('--p-purple-400'), documentStyle.getPropertyValue('--p-teal-400')]
            }
        ]
    };
}

onMounted(() => {
    setColorOptions();
    GraficaService.getEstadisticasProformas()
        .then((data) => {
            dataCircular.value = transformarDatosCircular(data);
            dataPie.value = transformarDatosPie(data);
        })
        .catch((error) => {
            console.error('Error al cargar las graficas:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        });

    CitaService.getEventos()
        .then((data) => {
            eventos.value = data;
            opcionesCalendario.events = data;
        })
        .catch((error) => {
            console.error('Error al cargar los eventos:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los eventos', life: 3000 });
        });
});

function setColorOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    pieOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor
                }
            }
        }
    };
}

watch(
    [getPrimary, getSurface, isDarkTheme],
    () => {
        setColorOptions();
    },
    { immediate: true }
);
</script>

<template>
    <Fluid class="grid grid-cols-12 gap-8">
        <div class="col-span-12 xl:col-span-6">
            <div class="card flex flex-col items-center">
                <div class="font-semibold text-xl mb-4">Total de Proformas</div>
                <Chart type="pie" :data="dataPie" :options="pieOptions"></Chart>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6">
            <div class="card flex flex-col items-center">
                <div class="font-semibold text-xl mb-4">Estado de Proformas</div>
                <Chart type="doughnut" :data="dataCircular" :options="pieOptions"></Chart>
            </div>
        </div>
        <div class="col-span-12">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Agenda de Citas</div>
                <FullCalendar :options="opcionesCalendario" class="w-full" />
            </div>
        </div>
    </Fluid>
</template>

<style scoped>
:deep(.fc) {
    background-color: var(--surface-card);
    border-radius: 0.5rem;
    padding: 1rem;
}

:deep(.fc-toolbar-title) {
    color: var(--text-color);
}

:deep(.fc-button) {
    background-color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
}

:deep(.fc-button:hover) {
    background-color: var(--primary-600) !important;
    border-color: var(--primary-600) !important;
}

:deep(.fc-event) {
    cursor: pointer;
    border: none;
    padding: 2px;
}

:deep(.fc-timegrid-slot) {
    height: 2em !important;
}

:deep(.fc-timegrid-axis) {
    color: var(--text-color);
}

:deep(.fc-col-header-cell) {
    color: var(--text-color);
}

:deep(.fc-timegrid-slot-label) {
    color: var(--text-color);
}

:deep(.fc-timegrid-slot) {
    color: var(--text-color);
}

:deep(.fc-event-time) {
    font-size: 0.8em;
    font-weight: bold;
    margin-bottom: 2px;
}

:deep(.fc-event-title) {
    font-weight: bold;
}

:deep(.fc-event-subtitle) {
    font-size: 0.8em;
    opacity: 0.8;
    margin-top: 2px;
}
</style>
