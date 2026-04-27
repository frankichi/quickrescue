import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/qr_scanner_screen.dart';
import 'screens/qr_detail_screen.dart';
import 'screens/qr_view_screen.dart';
import 'screens/diagnostic_screen.dart';
import 'screens/familiares_list_screen.dart';
import 'screens/familiar_form_screen.dart';
import 'screens/mascotas_list_screen.dart';
import 'screens/mascota_form_screen.dart';
import 'screens/escaneos_screen.dart';

void main() {
  runApp(const QuickRescueApp());
}

class QuickRescueApp extends StatelessWidget {
  const QuickRescueApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Quick Rescue',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFD62828),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      initialRoute: '/',
      routes: {
        '/':              (_) => const SplashScreen(),
        '/login':         (_) => const LoginScreen(),
        '/register':      (_) => const RegisterScreen(),
        '/home':          (_) => const HomeScreen(),
        '/profile':       (_) => const ProfileScreen(),
        '/familiares':    (_) => const FamiliaresListScreen(),
        '/familiar-form': (_) => const FamiliarFormScreen(),
        '/mascotas':      (_) => const MascotasListScreen(),
        '/mascota-form':  (_) => const MascotaFormScreen(),
        '/qr-view':       (_) => const QrViewScreen(),
        '/qr-scanner':    (_) => const QrScannerScreen(),
        '/qr-detail':     (_) => const QrDetailScreen(),
        '/escaneos':      (_) => const EscaneosScreen(),
        '/diagnostic':    (_) => const DiagnosticScreen(),
      },
    );
  }
}
