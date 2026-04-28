import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UsuarioAttributes {
  id: number;
  nombre: string;
  apellido: string;
  dni: string | null;
  email: string;
  password_hash: string;
  foto: string | null;
  onesignal_player_id: string | null;
  telefono: string | null;
  fecha_nacimiento: Date | null;
  direccion: string | null;
  distrito: string | null;
  provincia: string | null;
  activo: boolean;
  creado_en: Date;
  actualizado_en: Date | null;
}

type Creacion = Optional<
  UsuarioAttributes,
  'id' | 'dni' | 'foto' | 'onesignal_player_id' | 'telefono' | 'fecha_nacimiento' | 'direccion' | 'distrito' |
  'provincia' | 'activo' | 'creado_en' | 'actualizado_en'
>;

export class Usuario extends Model<UsuarioAttributes, Creacion> implements UsuarioAttributes {
  declare id: number;
  declare nombre: string;
  declare apellido: string;
  declare dni: string | null;
  declare email: string;
  declare password_hash: string;
  declare foto: string | null;
  declare onesignal_player_id: string | null;
  declare telefono: string | null;
  declare fecha_nacimiento: Date | null;
  declare direccion: string | null;
  declare distrito: string | null;
  declare provincia: string | null;
  declare activo: boolean;
  declare creado_en: Date;
  declare actualizado_en: Date | null;

  /** No exponer el hash de password al cliente. */
  toJSONSeguro(): Omit<UsuarioAttributes, 'password_hash'> {
    const { password_hash: _h, ...rest } = this.toJSON() as UsuarioAttributes;
    return rest;
  }
}

Usuario.init(
  {
    id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre:           { type: DataTypes.STRING(80),  allowNull: false },
    apellido:         { type: DataTypes.STRING(80),  allowNull: false },
    dni:              { type: DataTypes.STRING(15),  allowNull: true, unique: true },
    email:            { type: DataTypes.STRING(120), allowNull: false, unique: true },
    password_hash:       { type: DataTypes.STRING(255), allowNull: false },
    foto:                { type: DataTypes.STRING(500), allowNull: true },
    onesignal_player_id: { type: DataTypes.STRING(100), allowNull: true },
    telefono:            { type: DataTypes.STRING(20),  allowNull: true },
    fecha_nacimiento:    { type: DataTypes.DATEONLY,    allowNull: true },
    direccion:        { type: DataTypes.STRING(200), allowNull: true },
    distrito:         { type: DataTypes.STRING(60),  allowNull: true },
    provincia:        { type: DataTypes.STRING(60),  allowNull: true },
    activo:           { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: true },
    creado_en:        { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW },
    actualizado_en:   { type: DataTypes.DATE,        allowNull: true },
  },
  {
    sequelize,
    tableName: 'usuarios',
    modelName: 'Usuario',
  }
);
