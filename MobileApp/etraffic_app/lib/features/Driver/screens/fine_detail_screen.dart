import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../state/driver_provider.dart';
import '../widgets/settle_fine_modal.dart';

class FineDetailScreen extends ConsumerWidget {
  final int fineId;

  const FineDetailScreen({super.key, required this.fineId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final finesState = ref.watch(driverFinesProvider);

    // Find the fine in state, or show loading if not populated yet
    final fine = finesState.fines.isNotEmpty
        ? finesState.fines.firstWhere((element) => element.id == fineId, orElse: () => finesState.fines.first)
        : null;

    if (fine == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Fine Details')),
        body: const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor)),
      );
    }

    final isPending = fine.status == 'PENDING';

    return Scaffold(
      appBar: AppBar(
        title: Text(fine.referenceNumber),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Header
            Container(
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              decoration: BoxDecoration(
                color: (isPending ? AppTheme.warningColor : AppTheme.successColor).withOpacity(0.08),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: (isPending ? AppTheme.warningColor : AppTheme.successColor).withOpacity(0.2),
                ),
              ),
              child: Column(
                children: [
                  Icon(
                    isPending ? Icons.warning_amber_rounded : Icons.verified_user_rounded,
                    color: isPending ? AppTheme.warningColor : AppTheme.successColor,
                    size: 48,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    isPending ? 'PAYMENT OUTSTANDING' : 'SETTLED',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                      color: isPending ? AppTheme.warningColor : AppTheme.successColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'LKR ${NumberFormat('#,##0.00').format(fine.amount)}',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).textTheme.displayLarge?.color,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Fine Details Card
            Text(
              'VIOLATION DETAILS',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    _buildDetailRow(
                      icon: Icons.tag_rounded,
                      label: 'Reference Number',
                      value: fine.referenceNumber,
                    ),
                    const Divider(height: 24),
                    _buildDetailRow(
                      icon: Icons.assignment_late_outlined,
                      label: 'Violation Category',
                      value: fine.categoryName ?? 'Category #${fine.categoryId}',
                    ),
                    const Divider(height: 24),
                    _buildDetailRow(
                      icon: Icons.badge_outlined,
                      label: 'Driver License ID',
                      value: fine.driverId,
                    ),
                    const Divider(height: 24),
                    _buildDetailRow(
                      icon: Icons.assignment_ind_outlined,
                      label: 'Issuing Officer ID',
                      value: fine.officerId,
                    ),
                    const Divider(height: 24),
                    _buildDetailRow(
                      icon: Icons.calendar_today_outlined,
                      label: 'Issue Date',
                      value: DateFormat('yyyy-MM-dd HH:mm').format(fine.issueDate),
                    ),
                    const Divider(height: 24),
                    _buildDetailRow(
                      icon: Icons.event_busy_outlined,
                      label: 'Due Date',
                      value: DateFormat('yyyy-MM-dd HH:mm').format(fine.dueDate),
                      valueColor: isPending ? AppTheme.dangerColor : null,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),

            // Settle Button
            if (isPending)
              ElevatedButton(
                onPressed: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (context) => SettleFineModal(
                      fineId: fine.id,
                      amount: fine.amount,
                    ),
                  ).then((success) {
                    if (success == true && context.mounted) {
                      context.pop(); // Pop back to dashboard on payment success
                    }
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                ),
                child: const Text('PROCEED TO PAYMENT'),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: Colors.grey.shade500),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: valueColor,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
