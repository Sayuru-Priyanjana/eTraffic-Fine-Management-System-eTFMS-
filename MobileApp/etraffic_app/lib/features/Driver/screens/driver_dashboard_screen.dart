import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/state/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../state/driver_provider.dart';

class DriverDashboardScreen extends ConsumerStatefulWidget {
  const DriverDashboardScreen({super.key});

  @override
  ConsumerState<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends ConsumerState<DriverDashboardScreen> {
  int _tabIndex = 0;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final finesState = ref.watch(driverFinesProvider);

    final pendingFines = finesState.fines.where((f) => f.status == 'PENDING').toList();
    final paidFines = finesState.fines.where((f) => f.status == 'PAID').toList();

    final totalOutstanding = pendingFines.fold<double>(0, (sum, item) => sum + item.amount);
    
    final currentFinesList = _tabIndex == 0 ? pendingFines : paidFines;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Dashboard'),
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
        onRefresh: () => ref.read(driverFinesProvider.notifier).fetchFines(),
        color: AppTheme.primaryColor,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Welcome Header
              Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                    child: Text(
                      authState.username?.substring(0, 1).toUpperCase() ?? 'D',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome, ${authState.username ?? "Driver"}',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      Text(
                        'License: ${authState.userId ?? "N/A"}',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Summary Stats Card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.primaryColor,
                      AppTheme.primaryColor.withBlue(240),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'TOTAL OUTSTANDING FINE',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'LKR ${NumberFormat('#,##0.00').format(totalOutstanding)}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildStatSummary(
                          label: 'Pending Fines',
                          value: '${pendingFines.length}',
                        ),
                        Container(
                          width: 1,
                          height: 30,
                          color: Colors.white30,
                        ),
                        _buildStatSummary(
                          label: 'Settled Fines',
                          value: '${paidFines.length}',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              // Dashboard Tabs Header
              DefaultTabController(
                length: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TabBar(
                      labelColor: AppTheme.primaryColor,
                      unselectedLabelColor: AppTheme.lightTextSecondary,
                      indicatorColor: AppTheme.primaryColor,
                      onTap: (index) {
                        setState(() {
                          _tabIndex = index;
                        });
                      },
                      tabs: const [
                        Tab(text: 'Pending Fines'),
                        Tab(text: 'Payment History'),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Fine Content
                    if (finesState.isLoading)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 40.0),
                          child: CircularProgressIndicator(color: AppTheme.primaryColor),
                        ),
                      )
                    else if (finesState.error != null)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 40.0),
                          child: Text(
                            finesState.error!,
                            style: const TextStyle(color: AppTheme.dangerColor),
                          ),
                        ),
                      )
                    else ...[
                      if (currentFinesList.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 60.0),
                            child: Column(
                              children: [
                                Icon(Icons.check_circle_outline, size: 64, color: Colors.grey.shade400),
                                const SizedBox(height: 16),
                                Text(
                                  _tabIndex == 0 ? 'No pending fines found.' : 'No payment history found.',
                                  style: TextStyle(color: Colors.grey.shade500, fontSize: 16),
                                ),
                              ],
                            ),
                          ),
                        )
                      else ...[
                        Text(
                          _tabIndex == 0 ? 'Active Notifications / Violations' : 'Settled Violations',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 12),
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: currentFinesList.length,
                          itemBuilder: (context, index) {
                            final fine = currentFinesList[index];
                            final isPending = fine.status == 'PENDING';
                            return Card(
                              margin: const EdgeInsets.only(bottom: 16),
                              child: ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                leading: Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: (isPending ? AppTheme.warningColor : AppTheme.successColor).withOpacity(0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    isPending ? Icons.warning_amber_rounded : Icons.check_circle_rounded,
                                    color: isPending ? AppTheme.warningColor : AppTheme.successColor,
                                  ),
                                ),
                                title: Text(
                                  fine.referenceNumber,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 4),
                                    if (fine.categoryName != null)
                                      Text(fine.categoryName!, style: const TextStyle(fontWeight: FontWeight.w500)),
                                    Text('Due: ${DateFormat('yyyy-MM-dd').format(fine.dueDate)}'),
                                    const SizedBox(height: 2),
                                    Text(
                                      'LKR ${NumberFormat('#,##0.00').format(fine.amount)}',
                                      style: TextStyle(
                                        color: isPending ? AppTheme.dangerColor : AppTheme.successColor,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () => context.push('/driver/fine/${fine.id}'),
                              ),
                            );
                          },
                        ),
                      ],
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatSummary({required String label, required String value}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}
