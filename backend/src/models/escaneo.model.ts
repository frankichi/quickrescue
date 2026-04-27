import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type TipoEscaneo = 'usuario' | 'familiar' | 'mascota';

export interface EscaneoAttributes {
  id: number;
  tipo: TipoEscaneo;
  referencia_id: number;
  titular_id: number;
  latitud: number | null;
  longitud: number | null;
  ip: string | null;
  user_agent: string | null;
  creado_en: Date;
}

type Creacion = Optional<
  EscaneoAttributes,
  'id' | 'latitud' | 'longitud' | 'ip' | 'user_agent' | 'creado_en'
>;

export class Escaneo extends Model<EscaneoAttributes, Creacion> implements EscaneoAttributes {
  declare id: number;
  declare tipo: TipoEscaneo;
  declare referencia_id: number;
  declare titular_id: number;
  declare latitud: number | null;
  declare longitud: number | null;
  declare ip: string | null;
  declare user_agent: string | null;
  declare creado_en: Date;
}

Escaneo.init(
  {
    id:            { type: DataTypes.BIGINT,     primaryKey: true, autoIncrement: true },
    tipo:          { type: DataTypes.ENUM('usuario', 'familiar', 'mascota'), allowNull: false },
    referencia_id: { type: DataTypes.INTEGER,    allowNull: false },
    titular_id:    { type: DataTypes.INTEGER,    allowNull: false },
    latitud:       { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    longitud:      { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    ip:            { type: DataTypes.STRING(45),  allowNull: true },
    user_agent:    { type: DataTypes.STRING(500), allowNull: true },
    creado_en:     { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'escaneos_qr',
    modelName: 'Escaneo',
    timestamps: false,
  }
);
