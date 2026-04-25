class Familiar {
  final int id;
  final String nombre;
  final String telefono;
  final String? email;
  final String relacion;

  Familiar({
    required this.id, required this.nombre, required this.telefono,
    required this.relacion, this.email,
  });

  factory Familiar.fromJson(Map<String, dynamic> json) => Familiar(
    id:       json['id'] as int,
    nombre:   json['nombre']   as String,
    telefono: json['telefono'] as String,
    email:    json['email']    as String?,
    relacion: json['relacion'] as String,
  );
}
