import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FamiliarAttributes {
  id: number;
  usuario_id: number;
  nombre: string;
  apellido: string | null;
  dni: string | null;
  fecha_nacimiento: Date | null;
  telefono: string;
  email: string | null;
  relacion: string;
  foto: string | null;
  direccion: string | null;
  distrito: string | null;
  provincia: string | null;
  grupo_sanguineo: string | null;
  alergias: string | null;
  enfermedades: string | null;
  operaciones: string | null;
  medicamentos: string | null;
  creado_en: Date;
}

type Creacion = Optional<
  FamiliarAttributes,
  | 'id' | 'creado_en'
  | 'apellido' | 'dni' | 'fecha_nacimiento' | 'email' | 'foto'
  | 'direccion' | 'distrito' | 'provincia'
  | 'grupo_sanguineo' | 'alergias' | 'enfermedades' | 'operaciones' | 'medicamentos'
>;

export class Familiar extends Model<FamiliarAttributes, Creacion> implements FamiliarAttributes {
  declare id: number;
  declare usuario_id: number;
  declare nombre: string;
  declare apellido: string | null;
  declare dni: string | null;
  declare fecha_nacimiento: Date | null;
  declare telefono: string;
  declare email: string | null;
  declare relacion: string;
  declare foto: string | null;
  declare direccion: string | null;
  declare distrito: string | null;
  declare provincia: string | null;
  declare grupo_sanguineo: string | null;
  declare alergias: string | null;
  declare enfermedades: string | null;
  declare operaciones: string | null;
  declare medicamentos: string | null;
  declare creado_en: Date;
}

Familiar.init(
  {
    id:               { type: DataTypes.INTEGER,    primaryKey: true, autoIncrement: true },
    usuario_id:       { type: DataTypes.INTEGER,    allowNull: false },
    nombre:           { type: DataTypes.STRING(120), allowNull: false },
    apellido:         { type: DataTypes.STRING(80),  allowNull: true },
    dni:              { type: DataTypes.STRING(15),  allowNull: true },
    fecha_nacimiento: { type: DataTypes.DATEONLY,    allowNull: true },
    telefono:         { type: DataTypes.STRING(20),  allowNull: false },
    email:            { type: DataTypes.STRING(120), allowNull: true },
    relacion:         { type: DataTypes.STRING(40),  allowNull: false },
    foto:             { type: DataTypes.STRING(500), allowNull: true },
    direccion:        { type: DataTypes.STRING(200), allowNull: true },
    distrito:         { type: DataTypes.STRING(60),  allowNull: true },
    provincia:        { type: DataTypes.STRING(60),  allowNull: true },
    grupo_sanguineo:  { type: DataTypes.STRING(5),   allowNull: true },
    alergias:         { type: DataTypes.TEXT,        allowNull: true },
    enfermedades:     { type: DataTypes.TEXT,        allowNull: true },
    operaciones:      { type: DataTypes.TEXT,        allowNull: true },
    medicamentos:     { type: DataTypes.TEXT,        allowNull: true },
    creado_en:        { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'familiares',
    modelName: 'Familiar',
  }
);
