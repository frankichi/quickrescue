class Usuario {
  final int id;
  final String nombre;
  final String apellido;
  final String? dni;
  final String email;
  final String? foto;
  final String? fechaNacimiento;
  final String? direccion;
  final String? distrito;
  final String? provincia;

  Usuario({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.email,
    this.dni,
    this.foto,
    this.fechaNacimiento,
    this.direccion,
    this.distrito,
    this.provincia,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) => Usuario(
    id:        json['id'] as int,
    nombre:    json['nombre']    as String,
    apellido:  json['apellido']  as String,
    email:     json['email']     as String,
    dni:       json['dni']               as String?,
    foto:      json['foto']              as String?,
    fechaNacimiento: json['fecha_nacimiento'] as String?,
    direccion: json['direccion'] as String?,
    distrito:  json['distrito']  as String?,
    provincia: json['provincia'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'nombre': nombre, 'apellido': apellido, 'email': email,
    'dni': dni, 'foto': foto, 'fecha_nacimiento': fechaNacimiento,
    'direccion': direccion, 'distrito': distrito, 'provincia': provincia,
  };
}
