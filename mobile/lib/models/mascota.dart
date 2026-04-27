class Mascota {
  final int id;
  final int usuarioId;
  final String nombre;
  final String especie; // perro | gato | otro
  final String? raza;
  final String? color;
  final int? edadAnios;
  final String? foto;
  final String? microchip;
  final bool perdida;
  final String? mensajePerdida;

  Mascota({
    required this.id,
    required this.usuarioId,
    required this.nombre,
    required this.especie,
    this.raza, this.color, this.edadAnios,
    this.foto, this.microchip,
    this.perdida = false,
    this.mensajePerdida,
  });

  factory Mascota.fromJson(Map<String, dynamic> j) => Mascota(
    id:         j['id'] as int,
    usuarioId:  j['usuario_id'] as int,
    nombre:     j['nombre']   as String,
    especie:    j['especie']  as String,
    raza:       j['raza']     as String?,
    color:      j['color']    as String?,
    edadAnios:  j['edad_anios'] as int?,
    foto:       j['foto']       as String?,
    microchip:  j['microchip']  as String?,
    perdida:    (j['perdida'] as bool?) ?? false,
    mensajePerdida: j['mensaje_perdida'] as String?,
  );

  Map<String, dynamic> toJsonInput() => {
    'nombre': nombre,
    'especie': especie,
    'raza': raza,
    'color': color,
    'edad_anios': edadAnios,
    'foto': foto,
    'microchip': microchip,
    'perdida': perdida,
    'mensaje_perdida': mensajePerdida,
  };
}
