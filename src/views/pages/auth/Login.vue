<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { loginService } from '@/service/loginService';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const checked = ref(false);
const errorMessage = ref('');
const loading = ref(false);

const handleLogin = async () => {
    if (!email.value || !password.value) {
        errorMessage.value = 'Por favor, complete todos los campos';
        return;
    }

    loading.value = true;
    errorMessage.value = '';

    try {
        const userData = await loginService.authenticate(email.value, password.value);

        if (userData) {
            // Mantener localStorage para persistencia
            localStorage.setItem('userData', JSON.stringify(userData));
            // Redirigir al dashboard
            router.push('/dashboard');
        } else {
            // Si la autenticación falla, redirigir a la página de acceso
            router.push('/auth/access');
        }
    } catch (error) {
        // Si hay cualquier otro error, redirigir a la página de error
        router.push('/auth/error');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <img src="@/assets/logos/logo.svg" alt="Logo DentiSys" class="mb-8 w-16 shrink-0 mx-auto" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Bienvenido a Prisma</div>
                        <span class="text-muted-color font-medium">Inicia sesión para continuar</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Correo electrónico</label>
                        <InputText id="email1" type="text" placeholder="Dirección de correo electrónico" class="w-full md:w-[30rem] mb-8" v-model="email" @keyup.enter="handleLogin" />

                        <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Contraseña</label>
                        <Password id="password1" v-model="password" placeholder="Contraseña" :toggleMask="true" class="mb-4" fluid :feedback="false" @keyup.enter="handleLogin"></Password>

                        <div v-if="errorMessage" class="mb-4">
                            <Message severity="error" :closable="false">{{ errorMessage }}</Message>
                        </div>

                        <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                            <div class="flex items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Recordarme</label>
                            </div>
                            <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">¿Olvidaste tu contraseña?</span>
                        </div>
                        <Button label="Iniciar sesión" class="w-full" @click="handleLogin" :loading="loading"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
