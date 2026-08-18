export const rolPuedeAgendarCitas = (rol) => rol !== 'administrador'

export const rolPuedeVerContacto = (rol) => rol !== 'administrador'

export const estadoCitaPermiteGestion = (estado) => ['pendiente', 'confirmada'].includes(estado)
