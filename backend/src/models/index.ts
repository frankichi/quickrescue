import { Usuario } from './usuario.model';
import { Familiar } from './familiar.model';
import { HistorialMedico } from './historialMedico.model';
import { Ubicacion } from './ubicacion.model';

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
};

export { Usuario, Familiar, HistorialMedico, Ubicacion };
