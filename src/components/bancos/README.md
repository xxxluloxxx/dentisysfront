# Gestión de Bancos

Este módulo proporciona una funcionalidad completa de CRUD (Create, Read, Update, Delete) para la gestión de bancos en el sistema.

## Componentes

### BancosHeader.vue
Componente que contiene el encabezado de la página con:
- Título y descripción
- Botón para crear nuevo banco
- Botón para exportar datos
- Campo de búsqueda
- Botón para limpiar filtros

### BancosTable.vue
Tabla que muestra la lista de bancos con:
- Columnas: Color, Nombre de Cuenta, Banco, Número de Cuenta, Acciones
- Paginación
- Filtros por columna
- Botones de editar y eliminar
- Indicador de color visual

### BancoForm.vue
Formulario modal para crear y editar bancos con:
- Campos: Nombre de Cuenta, Banco, Número de Cuenta, Color
- Validaciones en tiempo real
- Selector de color con ColorPicker
- Botones de guardar y cancelar

### BancoDeleteConfirmationDialog.vue
Diálogo de confirmación para eliminar bancos con:
- Información del banco a eliminar
- Advertencia sobre la acción irreversible
- Botones de confirmar y cancelar

## Composable

### useBancos.js
Composable que maneja toda la lógica de negocio:
- Estados reactivos para loading, datos, etc.
- Métodos CRUD (crear, leer, actualizar, eliminar)
- Filtrado de datos
- Exportación a CSV
- Manejo de errores con toast notifications

## Endpoints Utilizados

- `GET /api/bancos` - Obtener todos los bancos
- `GET /api/bancos/{id}` - Obtener banco por ID
- `POST /api/bancos` - Crear nuevo banco
- `PUT /api/bancos/{id}` - Actualizar banco existente
- `DELETE /api/bancos/{id}` - Eliminar banco

## Estructura de Datos

```javascript
{
  id: number,
  nombreCuenta: string,
  banco: string,
  cuenta: string,
  color: string // Formato hexadecimal (#RRGGBB)
}
```

## Características

- ✅ Interfaz responsive
- ✅ Validaciones en tiempo real
- ✅ Notificaciones toast
- ✅ Filtrado y búsqueda
- ✅ Exportación a CSV
- ✅ Confirmación de eliminación
- ✅ Indicadores de loading
- ✅ Manejo de errores
- ✅ Tema oscuro/claro compatible

## Uso

La funcionalidad está integrada en la ruta `/pages/bancos` y utiliza el servicio `BancoService` para las operaciones de API. 
