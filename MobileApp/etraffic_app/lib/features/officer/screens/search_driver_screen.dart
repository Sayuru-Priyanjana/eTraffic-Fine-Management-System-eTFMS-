import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/fine.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';

class SearchDriverScreen extends ConsumerStatefulWidget {
  const SearchDriverScreen({super.key});

  @override
  ConsumerState<SearchDriverScreen> createState() => _SearchDriverScreenState();
}

class _SearchDriverScreenState extends ConsumerState<SearchDriverScreen> {
  final _searchController = TextEditingController();
  final List<Fine> _searchResults = [];
  bool _isLoading = false;
  String? _error;
  bool _hasSearched = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _isLoading = true;
      _error = null;
      _hasSearched = true;
      _searchResults.clear();
    });

    try {
      final response = await api.dio.get('/fines/driver/$query');
      if (response.statusCode == 200) {
        final list = (response.data as List)
            .map((item) => Fine.fromJson(item as Map<String, dynamic>))
            .toList();
        setState(() {
          _searchResults.addAll(list);
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'Failed to load driver violations';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Driver not found or connection error';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final pendingCount = _searchResults.where((f) => f.status == 'PENDING').length;
    final totalOutstanding = _searchResults
        .where((f) => f.status == 'PENDING')
        .fold<double>(0, (sum, f) => sum + f.amount);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lookup Driver Fines'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Search Input Row
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _searchController,
                      textCapitalization: TextCapitalization.characters,
                      textInputAction: TextInputAction.search,
                      onFieldSubmitted: (_) => _performSearch(),
                      decoration: const InputDecoration(
                        labelText: 'Driver License ID',
                        hintText: 'e.g. B-9876543',
                        prefixIcon: Icon(Icons.badge_outlined),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _performSearch,
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Icon(Icons.search),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Loading / Error / Results
              if (_isLoading)
                const Expanded(
                  child: Center(
                    child: CircularProgressIndicator(color: AppTheme.primaryColor),
                  ),
                )
              else if (_error != null)
                Expanded(
                  child: Center(
                    child: Text(
                      _error!,
                      style: const TextStyle(color: AppTheme.dangerColor),
                    ),
                  ),
                )
              else if (!_hasSearched)
                Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search, size: 64, color: Colors.grey.shade300),
                        const SizedBox(height: 12),
                        Text(
                          'Search by Driver ID to view history.',
                          style: TextStyle(color: Colors.grey.shade500),
                        ),
                      ],
                    ),
                  ),
                )
              else if (_searchResults.isEmpty)
                const Expanded(
                  child: Center(
                    child: Text('No fines recorded for this driver.'),
                  ),
                )
              else ...[
                // Driver Stats Summary
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Outstanding Penalty',
                            style: TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'LKR ${NumberFormat('#,##0.00').format(totalOutstanding)}',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.dangerColor,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text(
                            'Pending Fines',
                            style: TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '$pendingCount citation(s)',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Results list
                Expanded(
                  child: ListView.builder(
                    itemCount: _searchResults.length,
                    itemBuilder: (context, index) {
                      final fine = _searchResults[index];
                      final isPending = fine.status == 'PENDING';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          title: Text(
                            fine.referenceNumber,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text(
                            'Issued: ${DateFormat('yyyy-MM-dd').format(fine.issueDate)}',
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
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
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
                        ),
                      );
                    },
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
