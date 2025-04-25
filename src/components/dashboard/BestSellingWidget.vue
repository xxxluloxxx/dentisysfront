<script setup>
import { GraficaService } from '@/service/GraficaService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const productosFrecuentes = ref([]);
const loading = ref(true);

const colores = ['orange-500', 'cyan-500', 'pink-500', 'green-500', 'purple-500', 'teal-500', 'blue-500'];

onMounted(() => {
    GraficaService.getEstadisticasProductosFrecuentes()
        .then((data) => (productosFrecuentes.value = data))
        .catch((error) => {
            console.error('Error al cargar los productos frecuentes:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
});
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Servicios más solicitados</div>
        </div>
        <div v-if="loading" class="flex justify-center items-center py-8">
            <ProgressSpinner />
        </div>
        <ul v-else class="list-none p-0 m-0">
            <li v-for="(producto, index) in productosFrecuentes" :key="index" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">{{ producto.producto }}</span>
                </div>
                <div class="mt-2 md:mt-0 flex items-center">
                    <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                        <div :class="`bg-${colores[index % colores.length]} h-full`" :style="`width: ${producto.porcentaje}%`"></div>
                    </div>
                    <span :class="`text-${colores[index % colores.length]} ml-4 font-medium`">%{{ producto.porcentaje }}</span>
                </div>
            </li>
        </ul>
    </div>
</template>
