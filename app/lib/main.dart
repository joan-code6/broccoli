import 'package:flutter/material.dart';
import 'login_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Broccoli Login',
      theme: ThemeData(
        primaryColor: const Color(0xFF6C63FF),
        fontFamily: 'Roboto',
      ),
      home: LoginScreen(),
    );
  }
}
