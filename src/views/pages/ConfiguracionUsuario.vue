<script setup>
import { UsuarioService } from '@/service/UsuarioService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const userId = ref(null);
const usuario = ref({
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: ''
});
const loading = ref(false);
const submitted = ref(false);

// Función para cargar los datos del usuario
const cargarDatosUsuario = () => {
    loading.value = true;
    const userData = JSON.parse(localStorage.getItem('userData'));
    userId.value = userData?.id;

    if (userId.value) {
        UsuarioService.getById(userId.value)
            .then((data) => (usuario.value = data))
            .catch((error) => {
                console.error('Error al cargar los usuarios:', error);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
            })
            .finally(() => {
                loading.value = false;
            });
    }
};

onMounted(() => {
    cargarDatosUsuario();
});

// Función para guardar los cambios
const guardarCambios = () => {
    submitted.value = true;

    if (usuario.value.nombre?.trim() && usuario.value.apellido?.trim() && usuario.value.email?.trim() && usuario.value.numeroDocumento?.trim()) {
        loading.value = true;
        UsuarioService.update(userId.value, usuario.value)
            .then(() => {
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos actualizados correctamente', life: 3000 });
            })
            .catch((error) => {
                console.error('Error al actualizar usuario:', error);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar los datos', life: 3000 });
            })
            .finally(() => {
                loading.value = false;
                localStorage.removeItem('userData');
                router.push('/auth/login');
            });
    }
};
</script>

<template>
    <div class="card">
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold">Configuración de Usuario</h2>

            <div class="flex justify-center mb-4">
                <div class="avatar-container">
                    <i class="pi pi-user text-6xl"></i>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <label for="numero_documento" class="block font-bold mb-2">Número de Documento</label>
                    <InputText id="numeroDocumento" v-model.trim="usuario.numeroDocumento" required :class="{ 'p-invalid': submitted && !usuario.numeroDocumento }" class="w-full" />
                </div>

                <div class="field">
                    <label for="nombre" class="block font-bold mb-2">Nombre</label>
                    <InputText id="nombre" v-model.trim="usuario.nombre" required :class="{ 'p-invalid': submitted && !usuario.nombre }" class="w-full" />
                    <small v-if="submitted && !usuario.nombre" class="text-red-500">El nombre es requerido.</small>
                </div>

                <div class="field">
                    <label for="apellido" class="block font-bold mb-2">Apellido</label>
                    <InputText id="apellido" v-model.trim="usuario.apellido" required :class="{ 'p-invalid': submitted && !usuario.apellido }" class="w-full" />
                    <small v-if="submitted && !usuario.apellido" class="text-red-500">El apellido es requerido.</small>
                </div>

                <div class="field">
                    <label for="email" class="block font-bold mb-2">Email</label>
                    <InputText id="email" v-model.trim="usuario.email" required :class="{ 'p-invalid': submitted && !usuario.email }" class="w-full" />
                    <small v-if="submitted && !usuario.email" class="text-red-500">El email es requerido.</small>
                </div>

                <div class="field">
                    <label for="password" class="block font-bold mb-2">Contraseña</label>
                    <Password id="password" v-model="usuario.password" :feedback="false" toggleMask class="w-full" />
                </div>

                <div class="field">
                    <label for="telefono" class="block font-bold mb-2">Teléfono</label>
                    <InputText id="telefono" v-model.trim="usuario.telefono" class="w-full" />
                </div>
            </div>

            <div class="flex justify-end mt-4">
                <Button label="Guardar Cambios" icon="pi pi-check" @click="guardarCambios" :loading="loading" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    background: var(--surface-card);
    padding: 2rem;
    border-radius: 10px;
    box-shadow:
        0 2px 1px -1px rgba(0, 0, 0, 0.2),
        0 1px 1px 0 rgba(0, 0, 0, 0.14),
        0 1px 3px 0 rgba(0, 0, 0, 0.12);
}

.avatar-container {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: var(--surface-ground);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--primary-color);
}

.avatar-container i {
    color: var(--primary-color);
}

.field {
    margin-bottom: 1rem;
}

:deep(.p-inputtext) {
    background: var(--surface-ground);
    color: var(--text-color);
    border-color: var(--surface-border);
}

:deep(.p-inputtext:enabled:focus) {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 1px var(--primary-color);
}

:deep(.p-password) {
    width: 100%;
}

:deep(.p-password-input) {
    width: 100%;
}

@media (max-width: 768px) {
    .card {
        padding: 1rem;
    }
}
</style>
