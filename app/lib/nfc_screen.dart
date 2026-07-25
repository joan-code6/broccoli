import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:nfc_manager/nfc_manager.dart';
import 'history_screen.dart';

class NfcScreen extends StatefulWidget {
  const NfcScreen({super.key});

  @override
  State<NfcScreen> createState() => _NfcScreenState();
}

class _NfcScreenState extends State<NfcScreen> {
  bool _isSessionActive = false;

  @override
  void initState() {
    super.initState();
    _startNfcSession();
  }

  @override
  void dispose() {
    if (_isSessionActive) {
      NfcManager.instance.stopSession();
    }
    super.dispose();
  }

  Future<void> _startNfcSession() async {
    final isAvailable = await NfcManager.instance.isAvailable();

    if (!isAvailable) {
      return;
    }

    _isSessionActive = true;

    await NfcManager.instance.startSession(
      onDiscovered: (NfcTag tag) async {
        await NfcManager.instance.stopSession();
        _isSessionActive = false;
        if (!mounted) return;
        _handleTag();
      },
    );
  }

  void _handleTag() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const HistoryScreen(records: [])),
    );
  }

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
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _handleTag,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6C63FF),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Next (test)',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
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
