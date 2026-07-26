import 'dart:async';
import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'leaderboard_screen.dart';

class StatsScreen extends StatefulWidget {
  final String baseUrl;
  final String username;

  const StatsScreen({super.key, required this.baseUrl, required this.username});

  @override
  State<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends State<StatsScreen> {
  Timer? _timer;
  Map<String, dynamic>? _gameState;
  bool _loading = true;
  bool _isFetching = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _fetchState());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchState() async {
    if (_isFetching) return;
    _isFetching = true;
    try {
      final res = await http.get(Uri.parse('${widget.baseUrl}/state'));
      if (res.statusCode == 200 && mounted) {
        setState(() {
          _gameState = jsonDecode(res.body);
          _loading = false;
          _error = null;
        });
      }
    } catch (_) {
      if (mounted && _gameState == null) {
        setState(() {
          _loading = false;
          _error = 'Could not reach server';
        });
      }
    } finally {
      _isFetching = false;
    }
  }

  String? get _assignedSlot {
    if (_gameState == null) return null;
    final usernames = _gameState!['usernames'];
    if (usernames == null) return null;
    if (usernames['p1'] == widget.username) return 'p1';
    if (usernames['p2'] == widget.username) return 'p2';
    return null;
  }

  int get _myBroccoli {
    if (_gameState == null || _assignedSlot == null) return 0;
    return _gameState![_assignedSlot == 'p1' ? 'broccoli_1' : 'broccoli_2'] ?? 0;
  }

  String get _currentEvent {
    final event = _gameState?['event'];
    if (event == 'Sun') return 'Sun';
    if (event == 'Rain') return 'Rain';
    return 'None';
  }

  String get _currentMonth => _gameState?['month'] ?? 'January';
  String get _phase => _gameState?['phase'] ?? 'waiting';

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

  @override
  Widget build(BuildContext context) {
    final assigned = _assignedSlot != null;
    final eventIcon = _currentEvent == 'Sun'
        ? Icons.wb_sunny
        : _currentEvent == 'Rain'
            ? Icons.water_drop
            : Icons.cloud_off;

    final eventColor = _currentEvent == 'Sun'
        ? const Color(0xFFFFC107)
        : _currentEvent == 'Rain'
            ? const Color(0xFF42A5F5)
            : Colors.grey;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Color(0xFF6C63FF)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Your Stats',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Color(0xFF6C63FF),
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
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
            SafeArea(
              child: _loading
                  ? const Center(
                      child: CircularProgressIndicator(color: Color(0xFF6C63FF)),
                    )
                  : _error != null
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.cloud_off, size: 48, color: Colors.grey[400]),
                              const SizedBox(height: 12),
                              Text(
                                _error!,
                                style: TextStyle(fontSize: 15, color: Colors.grey[600]),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: () {
                                  setState(() {
                                    _loading = true;
                                    _error = null;
                                  });
                                  _fetchState();
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF6C63FF),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: const Text('Retry', style: TextStyle(color: Colors.white)),
                              ),
                            ],
                          ),
                        )
                      : Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                          child: Column(
                            children: [
                              Text(
                                widget.username,
                                style: const TextStyle(fontSize: 14, color: Colors.grey),
                              ),
                              const SizedBox(height: 28),
                              if (!assigned)
                                Container(
                                  padding: const EdgeInsets.all(24),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.7),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Column(
                                    children: [
                                      Icon(Icons.hourglass_top, size: 48, color: Colors.grey[400]),
                                      const SizedBox(height: 12),
                                      Text(
                                        'Waiting for game assignment...',
                                        style: TextStyle(fontSize: 15, color: Colors.grey[600]),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        'Ask the host to assign you as Player 1 or 2',
                                        style: TextStyle(fontSize: 12, color: Colors.grey[400]),
                                      ),
                                    ],
                                  ),
                                )
                              else ...[
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(24),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.7),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Column(
                                    children: [
                                      const Text(
                                        'Broccoli Size',
                                        style: TextStyle(fontSize: 13, color: Colors.grey),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        '$_myBroccoli',
                                        style: const TextStyle(
                                          fontSize: 56,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF4CAF50),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.7),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(eventIcon, size: 28, color: eventColor),
                                      const SizedBox(width: 10),
                                      Text(
                                        'Event: $_currentEvent',
                                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.7),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(Icons.calendar_month, size: 24, color: Color(0xFF6C63FF)),
                                      const SizedBox(width: 10),
                                      Text(
                                        '$_currentMonth  ·  $_phase',
                                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                              const Spacer(),
                              SizedBox(
                                width: double.infinity,
                                height: 52,
                                child: ElevatedButton(
                                  onPressed: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (context) => LeaderboardScreen(baseUrl: widget.baseUrl),
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF6C63FF),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    elevation: 0,
                                  ),
                                  child: const Text(
                                    'Leaderboard',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 12),
                            ],
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
