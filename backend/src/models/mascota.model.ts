import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface MascotaAttributes {
  id: number;
  usuario_id: number;
  nombre: string;
  especie: string;
  raza: string | null;
  color: string | null;
  edad_anios: number | null;
  foto: string | null;
  microchip: string | null;
  perdida: boolean;
  mensaje_perdida: string | null;
  creado_en: Date;
  actualizado_en: Date;
}

type Creacion = Optional<
  MascotaAttributes,
  | 'id'
  | 'raza'
  | 'color'
  | 'edad_anios'
  | 'foto'
  | 'microchip'
  | 'perdida'
  | 'mensaje_perdida'
  | 'creado_en'
  | 'actualizado_en'
>;

export class Mascota extends Model<MascotaAttributes, Creacion> implements MascotaAttributes {
  declare id: number;
  declare usuario_id: number;
  declare nombre: string;
  declare especie: string;
  declare raza: string | null;
  declare color: string | null;
  declare edad_anios: number | null;
  declare foto: string | null;
  declare microchip: string | null;
  declare perdida: boolean;
  declare mensaje_perdida: string | null;
  declare creado_en: Date;
  declare actualizado_en: Date;
}

Mascota.init(
  {
    id:              { type: DataTypes.INTEGER,    primaryKey: true, autoIncrement: true },
    usuario_id:      { type: DataTypes.INTEGER,    allowNull: false },
    nombre:          { type: DataTypes.STRING(80), allowNull: false },
    especie:         { type: DataTypes.STRING(20), allowNull: false },
    raza:            { type: DataTypes.STRING(60), allowNull: true },
    color:           { type: DataTypes.STRING(40), allowNull: true },
    edad_anios:      { type: DataTypes.INTEGER,    allowNull: true },
    foto:            { type: DataTypes.STRING(255),allowNull: true },
    microchip:       { type: DataTypes.STRING(40), allowNull: true },
    perdida:         { type: DataTypes.BOOLEAN,    allowNull: false, defaultValue: false },
    mensaje_perdida: { type: DataTypes.TEXT,       allowNull: true },
    creado_en:       { type: DataTypes.DATE,       allowNull: false, defaultValue: DataTypes.NOW },
    actualizado_en:  { type: DataTypes.DATE,       allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'mascotas',
    modelName: 'Mascota',
    updatedAt: 'actualizado_en',
    createdAt: 'creado_en',
  }
);
