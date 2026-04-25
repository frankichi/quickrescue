import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FamiliarAttributes {
  id: number;
  usuario_id: number;
  nombre: string;
  telefono: string;
  email: string | null;
  relacion: string;
  creado_en: Date;
}

type Creacion = Optional<FamiliarAttributes, 'id' | 'email' | 'creado_en'>;

export class Familiar extends Model<FamiliarAttributes, Creacion> implements FamiliarAttributes {
  declare id: number;
  declare usuario_id: number;
  declare nombre: string;
  declare telefono: string;
  declare email: string | null;
  declare relacion: string;
  declare creado_en: Date;
}

Familiar.init(
  {
    id:         { type: DataTypes.INTEGER,    primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER,    allowNull: false },
    nombre:     { type: DataTypes.STRING(120), allowNull: false },
    telefono:   { type: DataTypes.STRING(20),  allowNull: false },
    email:      { type: DataTypes.STRING(120), allowNull: true },
    relacion:   { type: DataTypes.STRING(40),  allowNull: false },
    creado_en:  { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'familiares',
    modelName: 'Familiar',
  }
);
