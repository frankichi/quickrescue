import { Usuario } from './usuario.model';
import { Familiar } from './familiar.model';
import { HistorialMedico } from './historialMedico.model';
import { Ubicacion } from './ubicacion.model';
import { Mascota } from './mascota.model';
import { Escaneo } from './escaneo.model';

/**
 * Registro de asociaciones entre modelos.
 * Llamar UNA vez al arrancar la app, antes de cualquier query.
 */
export const registrarAsociaciones = (): void => {
  // Usuario 1 → N Familiares
  Usuario.hasMany(Familiar, {
    foreignKey: 'usuario_id',
    as: 'familiares',
    onDelete: 'CASCADE',
  });
  Familiar.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Usuario 1 → 1 HistorialMedico
  Usuario.hasOne(HistorialMedico, {
    foreignKey: 'usuario_id',
    as: 'historial',
    onDelete: 'CASCADE',
  });
  HistorialMedico.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Usuario 1 → N Ubicaciones
  Usuario.hasMany(Ubicacion, {
    foreignKey: 'usuario_id',
    as: 'ubicaciones',
    onDelete: 'CASCADE',
  });
  Ubicacion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Usuario 1 → N Mascotas
  Usuario.hasMany(Mascota, {
    foreignKey: 'usuario_id',
    as: 'mascotas',
    onDelete: 'CASCADE',
  });
  Mascota.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  // Usuario 1 → N Escaneos QR (los recibidos como titular)
  Usuario.hasMany(Escaneo, {
    foreignKey: 'titular_id',
    as: 'escaneos',
    onDelete: 'CASCADE',
  });
  Escaneo.belongsTo(Usuario, { foreignKey: 'titular_id', as: 'titular' });
};

export { Usuario, Familiar, HistorialMedico, Ubicacion, Mascota, Escaneo };
