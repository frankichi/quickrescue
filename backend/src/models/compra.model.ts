import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type ProductoQR = 'collar' | 'pulsera' | 'llavero';
export type DestinatarioTipo = 'usuario' | 'familiar' | 'mascota';
export type EstadoCompra =
  | 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';

export interface CompraAttributes {
  id: number;
  usuario_id: number;
  producto: ProductoQR;
  destinatario_tipo: DestinatarioTipo;
  destinatario_id: number;
  precio: number;
  estado: EstadoCompra;
  notas: string | null;
  creado_en: Date;
  actualizado_en: Date;
}

type Creacion = Optional<
  CompraAttributes,
  'id' | 'estado' | 'notas' | 'creado_en' | 'actualizado_en'
>;

export class Compra extends Model<CompraAttributes, Creacion> implements CompraAttributes {
  declare id: number;
  declare usuario_id: number;
  declare producto: ProductoQR;
  declare destinatario_tipo: DestinatarioTipo;
  declare destinatario_id: number;
  declare precio: number;
  declare estado: EstadoCompra;
  declare notas: string | null;
  declare creado_en: Date;
  declare actualizado_en: Date;
}

Compra.init(
  {
    id:                { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id:        { type: DataTypes.INTEGER, allowNull: false },
    producto:          { type: DataTypes.ENUM('collar', 'pulsera', 'llavero'), allowNull: false },
    destinatario_tipo: { type: DataTypes.ENUM('usuario', 'familiar', 'mascota'), allowNull: false },
    destinatario_id:   { type: DataTypes.INTEGER, allowNull: false },
    precio:            { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    estado: {
      type: DataTypes.ENUM('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'),
      allowNull: false, defaultValue: 'pendiente',
    },
    notas:             { type: DataTypes.TEXT, allowNull: true },
    creado_en:         { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    actualizado_en:    { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'compras',
    modelName: 'Compra',
    updatedAt: 'actualizado_en',
    createdAt: 'creado_en',
  }
);
