import 'dart:async';
import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class LeaderboardScreen extends StatefulWidget {
  final String baseUrl;

  const LeaderboardScreen({super.key, required this.baseUrl});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
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

  Widget _playerCard({
    required String label,
    required String? username,
    required int score,
    required bool isWinner,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isWinner
            ? const Color(0xFF4CAF50).withOpacity(0.15)
            : Colors.white.withOpacity(0.7),
        borderRadius: BorderRadius.circular(16),
        border: isWinner
            ? Border.all(color: const Color(0xFF4CAF50).withOpacity(0.4), width: 2)
            : null,
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[500],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            username ?? '—',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: username != null ? Colors.black87 : Colors.grey[400],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '$score',
            style: TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.bold,
              color: isWinner ? const Color(0xFF4CAF50) : Colors.black87,
            ),
          ),
          if (isWinner) ...[
            const SizedBox(height: 8),
            const Text(
              'WINNER',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF4CAF50),
                letterSpacing: 2,
              ),
            ),
          ],
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p1Name = _gameState?['usernames']?['p1'] as String?;
    final p2Name = _gameState?['usernames']?['p2'] as String?;
    final score1 = _gameState?['broccoli_1'] ?? 0;
    final score2 = _gameState?['broccoli_2'] ?? 0;
    final phase = _gameState?['phase'] ?? 'waiting';
    final winner = _gameState?['winner'];

    final p1Wins = phase == 'over' && winner == 1;
    final p2Wins = phase == 'over' && winner == 2;
    final isTie = phase == 'over' && winner == 0;

    final event = _gameState?['event'] as String?;
    final eventIcon = event == 'Sun'
        ? Icons.wb_sunny
        : event == 'Rain'
            ? Icons.water_drop
            : null;
    final eventColor = event == 'Sun'
        ? const Color(0xFFFFC107)
        : event == 'Rain'
            ? const Color(0xFF42A5F5)
            : Colors.grey;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Color(0xFF6C63FF)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Leaderboard',
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
                                phase == 'over' ? 'Game Over' : 'Game in Progress',
                                style: const TextStyle(fontSize: 13, color: Colors.grey),
                              ),
                              const SizedBox(height: 24),
                              if (event != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.7),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(eventIcon!, size: 20, color: eventColor),
                                      const SizedBox(width: 8),
                                      Text(
                                        event,
                                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                                      ),
                                    ],
                                  ),
                                ),
                              if (event != null) const SizedBox(height: 20),
                              if (isTie)
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFC107).withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    "IT'S A TIE!",
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFFFFC107),
                                      letterSpacing: 2,
                                    ),
                                  ),
                                ),
                              if (isTie) const SizedBox(height: 20),
                              _playerCard(
                                label: 'Player 1',
                                username: p1Name,
                                score: score1,
                                isWinner: p1Wins,
                              ),
                              const SizedBox(height: 16),
                              _playerCard(
                                label: 'Player 2',
                                username: p2Name,
                                score: score2,
                                isWinner: p2Wins,
                              ),
                              const Spacer(),
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
