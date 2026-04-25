import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UbicacionAttributes {
  id: number;
  usuario_id: number;
  latitud: number;
  longitud: number;
  precision_m: number | null;
  es_sos: boolean;
  mensaje: string | null;
  timestamp: Date;
}

type Creacion = Optional<UbicacionAttributes, 'id' | 'precision_m' | 'es_sos' | 'mensaje' | 'timestamp'>;

export class Ubicacion extends Model<UbicacionAttributes, Creacion> implements UbicacionAttributes {
  declare id: number;
  declare usuario_id: number;
  declare latitud: number;
  declare longitud: number;
  declare precision_m: number | null;
  declare es_sos: boolean;
  declare mensaje: string | null;
  declare timestamp: Date;
}

Ubicacion.init(
  {
    id:          { type: DataTypes.BIGINT,       primaryKey: true, autoIncrement: true },
    usuario_id:  { type: DataTypes.INTEGER,      allowNull: false },
    // DECIMAL(10,7) cubre el planeta con ~1cm de precisión.
    latitud:     { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    longitud:    { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    precision_m: { type: DataTypes.SMALLINT,     allowNull: true },
    es_sos:      { type: DataTypes.BOOLEAN,      allowNull: false, defaultValue: false },
    mensaje:     { type: DataTypes.STRING(500),  allowNull: true },
    timestamp:   { type: DataTypes.DATE,         allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'ubicaciones',
    modelName: 'Ubicacion',
  }
);
