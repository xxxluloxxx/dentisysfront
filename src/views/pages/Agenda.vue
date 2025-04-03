<script setup>
import { CitaService } from '@/service/CitaService';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const citas = ref([]);
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
    height: 'auto',
    events: citas,
    eventContent: (arg) => {
        const horaInicio = arg.event.start ? new Date(arg.event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
        const horaFin = arg.event.end ? new Date(arg.event.end).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
        return {
            html: `
                <div class="fc-event-main-frame">
                    <div class="fc-event-time">${horaInicio} - ${horaFin}</div>
                    <div class="fc-event-title">${arg.event.title}</div>
                    ${arg.event.extendedProps.estado ? `<div class="fc-event-status">${arg.event.extendedProps.estado}</div>` : ''}
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
        // Agregar tooltip al evento
        info.el.title = info.event.extendedProps.description;
    }
};

onMounted(() => {
    CitaService.getAll()
        .then((data) => {
            console.log('Citas recibidas de la API:', data);
            citas.value = data;
            opcionesCalendario.events = data;
        })
        .catch((error) => {
            console.error('Error al cargar las citas:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las citas', life: 3000 });
        });
});
</script>

<template>
    <Fluid class="grid grid-cols-1 gap-8">
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

:deep(.fc-event-status) {
    font-size: 0.8em;
    font-weight: bold;
    margin-top: 2px;
    padding: 2px 4px;
    border-radius: 3px;
    background-color: var(--primary-100);
    color: var(--primary-700);
}
</style>
