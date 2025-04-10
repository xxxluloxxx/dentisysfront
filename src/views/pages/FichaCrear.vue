<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Estado del formulario
const formData = reactive({
    motivoConsulta: '',
    descripcion: '',
    antecedentes: [
        { antecedente: 'Alergia antibiótico', tiene: false, descripcion: '' },
        { antecedente: 'Alergia anestesia', tiene: false, descripcion: '' },
        { antecedente: 'Hemorragias', tiene: false, descripcion: '' },
        { antecedente: 'VIH/Sida', tiene: false, descripcion: '' },
        { antecedente: 'Tuberculosis', tiene: false, descripcion: '' },
        { antecedente: 'Asma', tiene: false, descripcion: '' },
        { antecedente: 'Diabetes', tiene: false, descripcion: '' },
        { antecedente: 'Hipertensión', tiene: false, descripcion: '' },
        { antecedente: 'Enf. Cardíacas', tiene: false, descripcion: '' },
        { antecedente: 'Otro', tiene: false, descripcion: '' }
    ],
    signosVitales: [
        { signo: 'Temperatura', valor: '' },
        { signo: 'Presión Arterial', valor: '' },
        { signo: 'Frecuencia Cardíaca', valor: '' },
        { signo: 'Frecuencia Respiratoria', valor: '' }
    ],
    examenEstomatognatico: [
        { examen: 'Labios', tiene: false, descripcion: '' },
        { examen: 'Mejillas', tiene: false, descripcion: '' },
        { examen: 'Maxilar superior', tiene: false, descripcion: '' },
        { examen: 'Maxilar inferior', tiene: false, descripcion: '' },
        { examen: 'Lengua', tiene: false, descripcion: '' },
        { examen: 'Paladar', tiene: false, descripcion: '' },
        { examen: 'Piso', tiene: false, descripcion: '' },
        { examen: 'Carrillos', tiene: false, descripcion: '' },
        { examen: 'Glándulas salivales', tiene: false, descripcion: '' },
        { examen: 'Oro faringe', tiene: false, descripcion: '' },
        { examen: 'A.T.M', tiene: false, descripcion: '' },
        { examen: 'Ganglios', tiene: false, descripcion: '' }
    ],
    odontograma: {
        superiorDerecho: [
            { diente: '1.8', descripcion: '' },
            { diente: '1.7', descripcion: '' },
            { diente: '1.6', descripcion: '' },
            { diente: '1.5', descripcion: '' },
            { diente: '1.4', descripcion: '' },
            { diente: '1.3', descripcion: '' },
            { diente: '1.2', descripcion: '' },
            { diente: '1.1', descripcion: '' }
        ],
        superiorIzquierdo: [
            { diente: '2.8', descripcion: '' },
            { diente: '2.7', descripcion: '' },
            { diente: '2.6', descripcion: '' },
            { diente: '2.5', descripcion: '' },
            { diente: '2.4', descripcion: '' },
            { diente: '2.3', descripcion: '' },
            { diente: '2.2', descripcion: '' },
            { diente: '2.1', descripcion: '' }
        ],
        inferiorDerecho: [
            { diente: '4.8', descripcion: '' },
            { diente: '4.7', descripcion: '' },
            { diente: '4.6', descripcion: '' },
            { diente: '4.5', descripcion: '' },
            { diente: '4.4', descripcion: '' },
            { diente: '4.3', descripcion: '' },
            { diente: '4.2', descripcion: '' },
            { diente: '4.1', descripcion: '' }
        ],
        inferiorIzquierdo: [
            { diente: '3.8', descripcion: '' },
            { diente: '3.7', descripcion: '' },
            { diente: '3.6', descripcion: '' },
            { diente: '3.5', descripcion: '' },
            { diente: '3.4', descripcion: '' },
            { diente: '3.3', descripcion: '' },
            { diente: '3.2', descripcion: '' },
            { diente: '3.1', descripcion: '' }
        ]
    },
    higieneOral: [
        { p1: '16', check1: false, p2: '17', check2: false, p3: '55', check3: false, placa: '', calculo: '', gingivitis: '' },
        { p1: '11', check1: false, p2: '21', check2: false, p3: '51', check3: false, placa: '', calculo: '', gingivitis: '' },
        { p1: '26', check1: false, p2: '27', check2: false, p3: '65', check3: false, placa: '', calculo: '', gingivitis: '' },
        { p1: '36', check1: false, p2: '37', check2: false, p3: '75', check3: false, placa: '', calculo: '', gingivitis: '' },
        { p1: '31', check1: false, p2: '41', check2: false, p3: '71', check3: false, placa: '', calculo: '', gingivitis: '' },
        { p1: '46', check1: false, p2: '47', check2: false, p3: '85', check3: false, placa: '', calculo: '', gingivitis: '' }
    ]
});

// Métodos
const toggleAntecedentes = () => {
    formData.antecedentes.forEach((antecedente) => {
        antecedente.tiene = false;
        antecedente.descripcion = '';
    });
};

const toggleExamenEstomatognatico = () => {
    formData.examenEstomatognatico.forEach((examen) => {
        examen.tiene = false;
        examen.descripcion = '';
    });
};

const guardarFicha = () => {
    // Aquí irá la lógica para guardar la ficha
    console.log('Guardando ficha:', formData);
    // Redirigir después de guardar
    router.push('/fichas');
};

const cancelar = () => {
    router.push('/fichas');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Crear Nueva Ficha</h5>
                <div class="grid">
                    <!-- Información Básica -->
                    <div class="col-12 md:col-6">
                        <div class="card">
                            <div class="field mb-4">
                                <label for="motivoConsulta" class="font-bold block mb-2">Motivo de la consulta</label>
                                <InputText id="motivoConsulta" v-model="formData.motivoConsulta" class="w-full" />
                            </div>
                            <div class="field mb-4">
                                <label for="descripcion" class="font-bold block mb-2">Enfermedad o problema actual</label>
                                <Textarea id="descripcion" v-model="formData.descripcion" rows="3" class="w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card">
                <!-- Tabla de Antecedentes -->
                <div class="col-12">
                    <div class="card">
                        <h5>Antecedentes personales y familiares</h5>
                        <div class="field-checkbox mb-4">
                            <InputSwitch v-model="formData.sinAntecedentes" @change="toggleAntecedentes" />
                            <label class="ml-2">No tiene antecedentes</label>
                        </div>
                        <DataTable :value="formData.antecedentes" class="p-datatable-sm">
                            <Column field="antecedente" header="Antecedente" style="width: 10%"></Column>
                            <Column field="tiene" header="Sí/No" style="width: 5%">
                                <template #body="slotProps">
                                    <Checkbox v-model="slotProps.data.tiene" :binary="true" />
                                </template>
                            </Column>
                            <Column field="descripcion" header="Descripción" style="width: 85%">
                                <template #body="slotProps">
                                    <InputText v-model="slotProps.data.descripcion" class="w-full" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </div>

            <div class="card">
                <!-- Tabla de Signos Vitales -->
                <div class="col-12">
                    <div class="card">
                        <h5>Signos Vitales</h5>
                        <DataTable :value="formData.signosVitales" class="p-datatable-sm">
                            <Column field="signo" header="Signo Vital" style="width: 20%"></Column>
                            <Column field="valor" header="Valor" style="width: 80%">
                                <template #body="slotProps">
                                    <InputText v-model="slotProps.data.valor" class="w-full" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </div>

            <div class="card">
                <!-- Tabla de Examen del Sistema Estomatognático -->
                <div class="col-12">
                    <div class="card">
                        <h5>Examen del Sistema Estomatognático</h5>
                        <div class="field-checkbox mb-4">
                            <InputSwitch v-model="formData.sinExamenEstomatognatico" @change="toggleExamenEstomatognatico" />
                            <label class="ml-2">No tiene hallazgos</label>
                        </div>
                        <DataTable :value="formData.examenEstomatognatico" class="p-datatable-sm">
                            <Column field="examen" header="Examen" style="width: 10%"></Column>
                            <Column field="tiene" header="Sí/No" style="width: 5%">
                                <template #body="slotProps">
                                    <Checkbox v-model="slotProps.data.tiene" :binary="true" />
                                </template>
                            </Column>
                            <Column field="descripcion" header="Descripción" style="width: 85%">
                                <template #body="slotProps">
                                    <InputText v-model="slotProps.data.descripcion" class="w-full" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </div>

            <div class="card">
                <h5>Odontograma</h5>
                <div class="mb-4">
                    <h6>Superior Derecho</h6>
                    <DataTable :value="formData.odontograma.superiorDerecho" class="p-datatable-sm">
                        <Column field="diente" header="Diente" style="width: 20%"></Column>
                        <Column field="descripcion" header="Descripción" style="width: 80%">
                            <template #body="slotProps">
                                <InputText v-model="slotProps.data.descripcion" class="w-full" />
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <div class="mb-4">
                    <h6>Superior Izquierdo</h6>
                    <DataTable :value="formData.odontograma.superiorIzquierdo" class="p-datatable-sm">
                        <Column field="diente" header="Diente" style="width: 20%"></Column>
                        <Column field="descripcion" header="Descripción" style="width: 80%">
                            <template #body="slotProps">
                                <InputText v-model="slotProps.data.descripcion" class="w-full" />
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <div class="mb-4">
                    <h6>Inferior Derecho</h6>
                    <DataTable :value="formData.odontograma.inferiorDerecho" class="p-datatable-sm">
                        <Column field="diente" header="Diente" style="width: 20%"></Column>
                        <Column field="descripcion" header="Descripción" style="width: 80%">
                            <template #body="slotProps">
                                <InputText v-model="slotProps.data.descripcion" class="w-full" />
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <div class="mb-4">
                    <h6>Inferior Izquierdo</h6>
                    <DataTable :value="formData.odontograma.inferiorIzquierdo" class="p-datatable-sm">
                        <Column field="diente" header="Diente" style="width: 20%"></Column>
                        <Column field="descripcion" header="Descripción" style="width: 80%">
                            <template #body="slotProps">
                                <InputText v-model="slotProps.data.descripcion" class="w-full" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <div class="card">
                <!-- Tabla de Examen del Sistema Estomatognático -->
                <div class="col-12">
                    <div class="card">
                        <h5>Higiene oral simplificada</h5>
                        <DataTable :value="formData.higieneOral" class="p-datatable-sm">
                            <Column field="p1" header="P1" style="width: 12%">
                                <template #body="slotProps">
                                    <span>{{ slotProps.data.p1 }}</span>
                                </template>
                            </Column>
                            <Column field="check1" header="" style="width: 4%">
                                <template #body="slotProps">
                                    <Checkbox v-model="slotProps.data.check1" :binary="true" />
                                </template>
                            </Column>
                            <Column field="p2" header="P2" style="width: 12%">
                                <template #body="slotProps">
                                    <span>{{ slotProps.data.p2 }}</span>
                                </template>
                            </Column>
                            <Column field="check2" header="" style="width: 4%">
                                <template #body="slotProps">
                                    <Checkbox v-model="slotProps.data.check2" :binary="true" />
                                </template>
                            </Column>
                            <Column field="p3" header="P3" style="width: 12%">
                                <template #body="slotProps">
                                    <span>{{ slotProps.data.p3 }}</span>
                                </template>
                            </Column>
                            <Column field="check3" header="" style="width: 4%">
                                <template #body="slotProps">
                                    <Checkbox v-model="slotProps.data.check3" :binary="true" />
                                </template>
                            </Column>
                            <Column field="placa" header="Placa (0 - 1 - 2 - 3)" style="width: 13%">
                                <template #body="slotProps">
                                    <InputNumber v-model="slotProps.data.placa" class="w-full" :min="0" :max="100" />
                                </template>
                            </Column>
                            <Column field="calculo" header="Calculo (0 - 1 - 2 - 3)" style="width: 13%">
                                <template #body="slotProps">
                                    <InputNumber v-model="slotProps.data.calculo" class="w-full" :min="0" :max="100" />
                                </template>
                            </Column>
                            <Column field="gingivitis" header="Gingivitis (0 - 1)" style="width: 13%">
                                <template #body="slotProps">
                                    <InputNumber v-model="slotProps.data.gingivitis" class="w-full" :min="0" :max="100" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="grid">
                    <div class="col-12">
                        <div class="card">
                            <div class="flex justify-content-end gap-2">
                                <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cancelar" />
                                <Button label="Guardar" icon="pi pi-check" @click="guardarFicha" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
