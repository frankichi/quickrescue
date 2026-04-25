import 'package:flutter/material.dart';
import '../services/auth_service.dart';

/// Decide a dónde ir según si hay sesión guardada.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    // Pequeño delay para que se vea el splash
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;
    final auth = await AuthService.isAuthenticated();
    Navigator.pushReplacementNamed(context, auth ? '/home' : '/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFD62828),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.health_and_safety, size: 80, color: Colors.white),
            SizedBox(height: 16),
            Text('Quick Rescue',
                 style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
            SizedBox(height: 24),
            CircularProgressIndicator(color: Colors.white),
          ],
        ),
      ),
    );
  }
}
