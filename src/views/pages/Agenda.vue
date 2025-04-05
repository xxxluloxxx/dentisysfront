<script setup>
import { CitaService } from '@/service/CitaService';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, onMounted, ref } from 'vue';

const toast = useToast();
const citas = ref([]);
const isMobile = ref(false);

const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
};

onBeforeMount(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
});

const opcionesCalendario = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: isMobile.value ? 'timeGridDay' : 'timeGridWeek',
    headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: isMobile.value ? 'timeGridDay' : 'dayGridMonth,timeGridWeek,timeGridDay'
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
    font-size: 1.2rem;
}

:deep(.fc-button) {
    background-color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    padding: 0.5rem !important;
    font-size: 0.9rem !important;
}

:deep(.fc-button:hover) {
    background-color: var(--primary-600) !important;
    border-color: var(--primary-600) !important;
}

:deep(.fc-event) {
    cursor: pointer;
    border: none;
    padding: 2px;
    margin: 1px 0;
    overflow: hidden;
}

:deep(.fc-event-main) {
    padding: 2px 4px;
}

:deep(.fc-event-main-frame) {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
}

:deep(.fc-event-time) {
    font-size: 0.75em;
    font-weight: bold;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.fc-event-title) {
    font-weight: bold;
    font-size: 0.85em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.fc-event-status) {
    font-size: 0.7em;
    font-weight: bold;
    margin-top: 2px;
    padding: 1px 3px;
    border-radius: 3px;
    background-color: var(--primary-100);
    color: var(--primary-700);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.fc-timegrid-slot) {
    height: 2em !important;
}

:deep(.fc-timegrid-axis) {
    color: var(--text-color) !important;
}

:deep(.fc-col-header-cell) {
    color: var(--text-color) !important;
    background-color: var(--surface-card) !important;
}

:deep(.fc-timegrid-slot-label) {
    color: var(--text-color) !important;
}

:deep(.fc-timegrid-slot) {
    color: var(--text-color) !important;
}

:deep(.fc-timegrid-axis-cushion) {
    color: var(--text-color) !important;
}

:deep(.fc-col-header-cell-cushion) {
    color: var(--text-color) !important;
}

:deep(.fc-daygrid-day-number) {
    color: var(--text-color) !important;
}

:deep(.fc-theme-standard td) {
    border-color: var(--surface-border) !important;
}

:deep(.fc-theme-standard th) {
    border-color: var(--surface-border) !important;
}

@media screen and (max-width: 768px) {
    :deep(.fc-toolbar) {
        flex-direction: column;
        gap: 1rem;
    }

    :deep(.fc-toolbar-title) {
        font-size: 1rem;
    }

    :deep(.fc-button) {
        padding: 0.4rem !important;
        font-size: 0.8rem !important;
    }

    :deep(.fc-event-time) {
        font-size: 0.65em;
    }

    :deep(.fc-event-title) {
        font-size: 0.75em;
    }

    :deep(.fc-event-status) {
        font-size: 0.6em;
    }

    :deep(.fc-timegrid-slot) {
        height: 1.8em !important;
    }
}
</style>
