<script setup>
import { ImagenFichaService } from '@/service/ImagenFicha';
import Button from 'primevue/button';
import Carousel from 'primevue/carousel';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const fileupload = ref(null);
const imagenBase64 = ref('https://primefaces.org/cdn/primevue/images/galleria/galleria10.jpg');
const imagenesFicha = ref([]);
const visible = ref(false);
const imagenSeleccionada = ref(null);
const isZoomed = ref(false);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const translateX = ref(0);
const translateY = ref(0);

const carouselResponsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
    }
]);

onMounted(() => {
    ImagenFichaService.getAll()
        .then((data) => {
            imagenesFicha.value = data;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Imágenes cargadas correctamente', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al cargar las imágenes:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las imágenes', life: 3000 });
        });
});

const onUpload = (event) => {
    console.log('Evento de upload recibido:', event);
    if (event.files && event.files.length > 0) {
        const file = event.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const base64 = e.target.result;
            console.log('Base64 de la imagen:', base64);
            imagenBase64.value = base64;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Imagen convertida a base64', life: 3000 });
        };

        reader.onerror = (error) => {
            console.error('Error al leer el archivo:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al procesar la imagen', life: 3000 });
        };

        reader.readAsDataURL(file);
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se seleccionó ningún archivo', life: 3000 });
    }
};

const upload = () => {
    console.log('Botón upload presionado');
    if (fileupload.value) {
        console.log('Iniciando upload...');
        fileupload.value.upload();
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor selecciona un archivo primero', life: 3000 });
    }
};

const mostrarImagen = (imagen) => {
    imagenSeleccionada.value = imagen;
    visible.value = true;
};

const toggleZoom = () => {
    isZoomed.value = !isZoomed.value;
    if (!isZoomed.value) {
        translateX.value = 0;
        translateY.value = 0;
    }
};

const startDragging = (e) => {
    if (isZoomed.value) {
        isDragging.value = true;
        startX.value = e.clientX - translateX.value;
        startY.value = e.clientY - translateY.value;
    }
};

const stopDragging = () => {
    isDragging.value = false;
};

const drag = (e) => {
    if (isDragging.value && isZoomed.value) {
        e.preventDefault();
        translateX.value = e.clientX - startX.value;
        translateY.value = e.clientY - startY.value;
    }
};
</script>

<template>
    <div class="col-span-full lg:col-span-6">
        <div class="card">
            <div class="font-semibold text-xl mb-4">Basic</div>
            <div class="card flex flex-col gap-6 items-center justify-center">
                <Toast />
                <FileUpload ref="fileupload" mode="basic" name="demo[]" accept="image/*" :maxFileSize="1000000" @select="onUpload" :auto="false" />
                <Button label="Upload" @click="upload" severity="secondary" />
            </div>
        </div>
    </div>

    <div class="card">
        <div class="font-semibold text-xl mb-4">Image</div>
        <Image :src="imagenBase64" alt="Image" width="250" />
    </div>

    <div class="card">
        <div class="font-semibold text-xl mb-4">Carousel de Imágenes de Ficha</div>
        <Carousel :value="imagenesFicha" :numVisible="3" :numScroll="3" :responsiveOptions="carouselResponsiveOptions">
            <template #item="slotProps">
                <div class="border border-surface-200 dark:border-surface-700 rounded m-2 p-4">
                    <div class="mb-4">
                        <div class="relative mx-auto">
                            <img :src="slotProps.data.imagenBase64" :alt="'Imagen de ficha'" class="w-full rounded cursor-pointer hover:opacity-80 transition-opacity" @click="mostrarImagen(slotProps.data)" />
                        </div>
                    </div>
                </div>
            </template>
        </Carousel>
    </div>

    <Dialog v-model:visible="visible" modal :style="{ width: '90vw', maxWidth: '800px' }" :draggable="false">
        <div class="image-container">
            <img
                v-if="imagenSeleccionada"
                :src="imagenSeleccionada.imagenBase64"
                :alt="'Imagen de ficha'"
                class="zoomable-image"
                :class="{ zoomed: isZoomed }"
                :style="{
                    transform: `scale(${isZoomed ? 2 : 1}) translate(${translateX}px, ${translateY}px)`
                }"
                @click="toggleZoom"
                @mousedown="startDragging"
                @mouseup="stopDragging"
                @mouseleave="stopDragging"
                @mousemove="drag"
            />
            <div class="zoom-controls">
                <Button icon="pi pi-search-plus" @click="toggleZoom" severity="secondary" />
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.p-dialog-content {
    padding: 0;
}

.image-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.zoomable-image {
    width: 100%;
    height: auto;
    cursor: zoom-in;
    transition: transform 0.3s ease;
    user-select: none;
}

.zoomable-image.zoomed {
    cursor: grab;
}

.zoomable-image.zoomed:active {
    cursor: grabbing;
}

.zoom-controls {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}
</style>
