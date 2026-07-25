import 'package:flutter/material.dart';

class HistoryRecord {
  final String opponentId;
  final int wins;
  final int losses;

  const HistoryRecord({
    required this.opponentId,
    required this.wins,
    required this.losses,
  });
}

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key, required this.records});

  final List<HistoryRecord> records;

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
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'History',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF6C63FF),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Your record against each player',
                  style: TextStyle(fontSize: 13, color: Colors.grey),
                ),
                const SizedBox(height: 20),
                Expanded(
                  child: records.isEmpty
                      ? const Center(
                          child: Text(
                            'No matches yet',
                            style: TextStyle(fontSize: 14, color: Colors.grey),
                          ),
                        )
                      : ListView.separated(
                          itemCount: records.length,
                          separatorBuilder: (context, index) =>
                              const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final record = records[index];
                            final isWinning = record.wins >= record.losses;
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 14,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      record.opponentId,
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w500,
                                        color: Colors.black87,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '${record.wins} : ${record.losses}',
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: isWinning
                                          ? const Color(0xFF4CAF50)
                                          : const Color(0xFFE53935),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
