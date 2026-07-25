import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class NfcScreen extends StatelessWidget {
  const NfcScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFF3F1FF), Color(0xFFEAF7EC)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Tap your phone to NFC',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF6C63FF),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Hold your phone near the reader to continue',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  Lottie.asset(
                    'assets/animations/read_sensor_nfc.json',
                    width: 240,
                    height: 240,
                    repeat: true,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
