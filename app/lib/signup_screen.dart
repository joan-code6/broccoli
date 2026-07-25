import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isSaving = false;
  String? _errorMessage;
  Timer? _errorTimer;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _errorTimer?.cancel();
    super.dispose();
  }

  void _showError(String message) {
    _errorTimer?.cancel();
    setState(() {
      _errorMessage = message;
    });
    _errorTimer = Timer(const Duration(seconds: 2), () {
      if (!mounted) return;
      setState(() {
        _errorMessage = null;
      });
    });
  }

  Future<void> _handleSignup() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      _showError('Enter your username and password');
      return;
    }

    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });
    _errorTimer?.cancel();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('saved_email', email);
    await prefs.setString('saved_password', password);

    setState(() {
      _isSaving = false;
    });

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Account created, able to login')),
    );

    Navigator.of(context).pop();
  }

  Widget _blurBlob({
    required double size,
    required Color color,
    double blurSigma = 40,
  }) {
    return ImageFiltered(
      imageFilter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(shape: BoxShape.circle, color: color),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool obscureText = false,
    Widget? suffixIcon,
  }) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: const Color(0xFFF3F3F7),
        borderRadius: BorderRadius.circular(12),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscureText,
        style: const TextStyle(fontSize: 14),
        decoration: InputDecoration(
          prefixIcon: Icon(icon, color: Colors.grey, size: 20),
          suffixIcon: suffixIcon,
          hintText: hint,
          hintStyle: const TextStyle(fontSize: 14, color: Colors.grey),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
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
        child: Stack(
          children: [
            Positioned(
              top: -60,
              left: -60,
              child: _blurBlob(
                size: 220,
                color: const Color(0xFF6C63FF).withOpacity(0.15),
              ),
            ),
            Positioned(
              bottom: -40,
              right: -50,
              child: _blurBlob(
                size: 200,
                color: const Color(0xFF4CAF50).withOpacity(0.12),
              ),
            ),
            Positioned(
              top: 110,
              right: -30,
              child: _blurBlob(
                size: 110,
                color: const Color(0xFFFFC107).withOpacity(0.10),
                blurSigma: 30,
              ),
            ),
            SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: double.infinity,
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: IconButton(
                            onPressed: () => Navigator.of(context).pop(),
                            icon: const Icon(
                              Icons.arrow_back,
                              color: Color(0xFF6C63FF),
                            ),
                            padding: EdgeInsets.zero,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Sign up',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF6C63FF),
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Create an account to start playing',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 13, color: Colors.grey),
                      ),
                      const SizedBox(height: 28),
                      _buildTextField(
                        controller: _emailController,
                        hint: 'Username',
                        icon: Icons.person_outline,
                      ),
                      const SizedBox(height: 14),
                      _buildTextField(
                        controller: _passwordController,
                        hint: 'Enter your password',
                        icon: Icons.lock_outline,
                        obscureText: _obscurePassword,
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: Colors.grey,
                          ),
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton(
                          onPressed: _isSaving ? null : _handleSignup,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6C63FF),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 0,
                          ),
                          child: _isSaving
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text(
                                  'Sign up',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      if (_errorMessage != null)
                        Text(
                          _errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.red,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
