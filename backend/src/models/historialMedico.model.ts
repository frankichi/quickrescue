import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface HistorialAttributes {
  id: number;
  usuario_id: number;
  alergias: string | null;
  enfermedades: string | null;
  operaciones: string | null;
  medicamentos: string | null;
  grupo_sanguineo: string | null;
  actualizado_en: Date;
}

type Creacion = Optional<
  HistorialAttributes,
  'id' | 'alergias' | 'enfermedades' | 'operaciones' | 'medicamentos' | 'grupo_sanguineo' | 'actualizado_en'
>;

export class HistorialMedico extends Model<HistorialAttributes, Creacion>
  implements HistorialAttributes
{
  declare id: number;
  declare usuario_id: number;
  declare alergias: string | null;
  declare enfermedades: string | null;
  declare operaciones: string | null;
  declare medicamentos: string | null;
  declare grupo_sanguineo: string | null;
  declare actualizado_en: Date;
}

HistorialMedico.init(
  {
    id:              { type: DataTypes.INTEGER,    primaryKey: true, autoIncrement: true },
    usuario_id:      { type: DataTypes.INTEGER,    allowNull: false, unique: true },
    alergias:        { type: DataTypes.TEXT,       allowNull: true },
    enfermedades:    { type: DataTypes.TEXT,       allowNull: true },
    operaciones:     { type: DataTypes.TEXT,       allowNull: true },
    medicamentos:    { type: DataTypes.TEXT,       allowNull: true },
    grupo_sanguineo: { type: DataTypes.STRING(5),  allowNull: true },
    actualizado_en:  { type: DataTypes.DATE,       allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'historial_medico',
    modelName: 'HistorialMedico',
  }
);
