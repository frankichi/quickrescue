import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/sos_screen.dart';
import 'screens/profile_screen.dart';

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
        '/':        (_) => const SplashScreen(),
        '/login':   (_) => const LoginScreen(),
        '/home':    (_) => const HomeScreen(),
        '/sos':     (_) => const SosScreen(),
        '/profile': (_) => const ProfileScreen(),
      },
    );
  }
}
