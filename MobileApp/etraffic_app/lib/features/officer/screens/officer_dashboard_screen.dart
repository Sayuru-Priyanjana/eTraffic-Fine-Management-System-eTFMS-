import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/state/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../state/officer_provider.dart';

class OfficerDashboardScreen extends ConsumerWidget {
  const OfficerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final officerState = ref.watch(officerProvider);

    final issuedCount = officerState.issuedFines.length;
    final totalIssuedAmount = officerState.issuedFines.fold<double>(0, (sum, f) => sum + f.amount);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Police Portal'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(officerProvider.notifier).fetchIssuedFines(),
        color: AppTheme.primaryColor,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Profile Header
              Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppTheme.accentColor.withOpacity(0.1),
                    child: Text(
                      authState.username?.substring(0, 1).toUpperCase() ?? 'P',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.accentColor,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Officer: ${authState.username ?? "Police Officer"}',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      Text(
                        'Badge ID: ${authState.userId ?? "N/A"}',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Quick Action Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => context.push('/officer/issue'),
                      icon: const Icon(Icons.add),
                      label: const Text('ISSUE FINE'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => context.push('/officer/search'),
                      icon: const Icon(Icons.search),
                      label: const Text('LOOKUP'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.accentColor,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Statistics Grid
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 1.4,
                children: [
                  _buildStatCard(
                    context,
                    title: 'Fines Issued',
                    value: '$issuedCount',
                    icon: Icons.assignment_outlined,
                    color: AppTheme.primaryColor,
                  ),
                  _buildStatCard(
                    context,
                    title: 'Total Penalty LKR',
                    value: NumberFormat('#,##0').format(totalIssuedAmount),
                    icon: Icons.account_balance_wallet_outlined,
                    color: AppTheme.warningColor,
                  ),
                ],
              ),
              const SizedBox(height: 30),

              // History list header
              Text(
                'Recent Citations Issued',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),

              if (officerState.isLoadingFines)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 40.0),
                    child: CircularProgressIndicator(color: AppTheme.primaryColor),
                  ),
                )
              else if (officerState.error != null)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40.0),
                    child: Text(
                      officerState.error!,
                      style: const TextStyle(color: AppTheme.dangerColor),
                    ),
                  ),
                )
              else if (officerState.issuedFines.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 60.0),
                    child: Column(
                      children: [
                        Icon(Icons.history, size: 64, color: Colors.grey.shade400),
                        const SizedBox(height: 16),
                        Text(
                          'No citations issued yet.',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: officerState.issuedFines.length,
                  itemBuilder: (context, index) {
                    final fine = officerState.issuedFines[index];
                    final isPending = fine.status == 'PENDING';

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        title: Text(
                          fine.referenceNumber,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            if (fine.categoryName != null)
                              Text('Violation: ${fine.categoryName}'),
                            Text('Driver ID: ${fine.driverId}'),
                            Text('Issued: ${DateFormat('yyyy-MM-dd').format(fine.issueDate)}'),
                          ],
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'LKR ${NumberFormat('#,##0.00').format(fine.amount)}',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: (isPending ? AppTheme.warningColor : AppTheme.successColor).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                fine.status,
                                style: TextStyle(
                                  color: isPending ? AppTheme.warningColor : AppTheme.successColor,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        onLongPress: () {
                          // Allow officer to cancel/update the status of the fine
                          if (isPending) {
                            _showCancelDialog(context, ref, fine.id);
                          }
                        },
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showCancelDialog(BuildContext context, WidgetRef ref, int fineId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Citation?'),
        content: const Text('Are you sure you want to cancel this pending citation? This action is administrative and will update status to CANCELLED.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('NO'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await ref
                  .read(officerProvider.notifier)
                  .cancelOrUpdateFine(fineId, status: 'CANCELLED');
              if (success && context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Citation cancelled successfully.'),
                    backgroundColor: AppTheme.successColor,
                  ),
                );
              }
            },
            child: const Text(
              'YES, CANCEL',
              style: TextStyle(color: AppTheme.dangerColor),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: color, size: 24),
                Text(
                  title,
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade500, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            Text(
              value,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).textTheme.displayLarge?.color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
