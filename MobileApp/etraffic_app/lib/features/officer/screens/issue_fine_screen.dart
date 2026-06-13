import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/fine_category.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';
import '../state/officer_provider.dart';

class IssueFineScreen extends ConsumerStatefulWidget {
  const IssueFineScreen({super.key});

  @override
  ConsumerState<IssueFineScreen> createState() => _IssueFineScreenState();
}

class _IssueFineScreenState extends ConsumerState<IssueFineScreen> {
  final _formKey = GlobalKey<FormState>();
  final _driverIdController = TextEditingController();
  FineCategory? _selectedCategory;
  DateTime? _selectedDueDate;
  
  bool _isSearchingDriver = false;
  Map<String, dynamic>? _driverDetails;
  String? _driverSearchError;

  @override
  void initState() {
    super.initState();
    // Default due date is 14 days from now
    _selectedDueDate = DateTime.now().add(const Duration(days: 14));
  }

  @override
  void dispose() {
    _driverIdController.dispose();
    super.dispose();
  }

  Future<void> _pickDueDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDueDate ?? DateTime.now().add(const Duration(days: 14)),
      firstDate: DateTime.now().add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primaryColor,
              onPrimary: Colors.white,
              onSurface: Colors.black87,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedDueDate = DateTime(picked.year, picked.month, picked.day, 23, 59, 59);
      });
    }
  }

  Future<void> _searchDriver() async {
    final driverId = _driverIdController.text.trim();
    if (driverId.isEmpty) return;

    setState(() {
      _isSearchingDriver = true;
      _driverSearchError = null;
      _driverDetails = null;
    });

    try {
      final response = await api.dio.get('/users/$driverId');
      if (response.statusCode == 200 && response.data != null) {
        setState(() {
          _driverDetails = response.data;
        });
      }
    } catch (e) {
      setState(() {
        _driverSearchError = 'Driver not found.';
      });
    } finally {
      setState(() {
        _isSearchingDriver = false;
      });
    }
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      if (_selectedCategory == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a fine category')),
        );
        return;
      }

      final notifier = ref.read(officerProvider.notifier);
      final fine = await notifier.issueFine(
        categoryId: _selectedCategory!.id,
        driverId: _driverIdController.text.trim(),
        dueDate: _selectedDueDate!,
      );

      if (fine != null && mounted) {
        // Show success sheet/dialog
        _showSuccessDialog(fine.referenceNumber, fine.amount);
      } else {
        final error = ref.read(officerProvider).error ?? 'Failed to issue fine';
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(error),
              backgroundColor: AppTheme.dangerColor,
            ),
          );
        }
      }
    }
  }

  void _showSuccessDialog(String reference, double amount) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 16),
            const CircleAvatar(
              radius: 36,
              backgroundColor: AppTheme.successColor,
              child: Icon(Icons.check, size: 44, color: Colors.white),
            ),
            const SizedBox(height: 24),
            const Text(
              'Fine Issued Successfully',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'Reference: $reference',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            Text('Amount: LKR ${NumberFormat('#,##0.00').format(amount)}'),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // Pop dialog
                  context.pop(); // Pop screen back to dashboard
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.successColor,
                ),
                child: const Text('DONE'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final officerState = ref.watch(officerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Issue Traffic Fine'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Icon Header
                const Icon(
                  Icons.receipt_long_outlined,
                  size: 54,
                  color: AppTheme.primaryColor,
                ),
                const SizedBox(height: 24),
                Text(
                  'Record Violation',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _driverIdController,
                        textCapitalization: TextCapitalization.characters,
                        textInputAction: TextInputAction.search,
                        onFieldSubmitted: (_) => _searchDriver(),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Driver License Number is required';
                          }
                          return null;
                        },
                        decoration: const InputDecoration(
                          labelText: 'Driver License ID',
                          prefixIcon: Icon(Icons.badge_outlined),
                          hintText: 'e.g. B-9876543',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    SizedBox(
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isSearchingDriver ? null : _searchDriver,
                        style: ElevatedButton.styleFrom(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                        ),
                        child: _isSearchingDriver 
                            ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Text('SEARCH'),
                      ),
                    ),
                  ],
                ),
                if (_driverSearchError != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Text(
                      _driverSearchError!,
                      style: const TextStyle(color: AppTheme.dangerColor, fontSize: 12),
                    ),
                  )
                else if (_driverDetails != null)
                  Container(
                    margin: const EdgeInsets.only(top: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.successColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.successColor.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: AppTheme.successColor),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Driver Verified: ${_driverDetails!['username'] ?? 'Unknown'}',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87),
                              ),
                              Text(
                                'ID: ${_driverDetails!['id']}',
                                style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 20),

                // Fine Category dropdown
                Text(
                  'Violation Category',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade500,
                  ),
                ),
                const SizedBox(height: 8),
                if (officerState.isLoadingCategories)
                  const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Center(child: CircularProgressIndicator(color: AppTheme.primaryColor)),
                  )
                else
                  DropdownButtonFormField<FineCategory>(
                    value: _selectedCategory,
                    isExpanded: true,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Theme.of(context).inputDecorationTheme.fillColor,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    ),
                    hint: const Text('Select Citation Category'),
                    items: officerState.categories.map((cat) {
                      return DropdownMenuItem<FineCategory>(
                        value: cat,
                        child: Text(
                          '${cat.identifier} (LKR ${cat.amount.toStringAsFixed(0)})',
                          overflow: TextOverflow.ellipsis,
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      setState(() {
                        _selectedCategory = val;
                      });
                    },
                    validator: (value) => value == null ? 'Selection required' : null,
                  ),
                const SizedBox(height: 20),

                // Due Date selector
                Text(
                  'Payment Due Date',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade500,
                  ),
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: _pickDueDate,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).inputDecorationTheme.fillColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _selectedDueDate == null
                              ? 'Select Date'
                              : DateFormat('yyyy-MM-dd (EEEE)').format(_selectedDueDate!),
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                        ),
                        const Icon(Icons.calendar_month, color: AppTheme.primaryColor),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 40),

                // Fine cost summary (if selected)
                if (_selectedCategory != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 24),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.primaryColor.withOpacity(0.2)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Penalty Cost:',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                        Text(
                          'LKR ${NumberFormat('#,##0.00').format(_selectedCategory!.amount)}',
                          style: const TextStyle(
                            color: AppTheme.dangerColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                      ],
                    ),
                  ),

                // Submit Button
                ElevatedButton(
                  onPressed: officerState.isSubmittingFine ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 18),
                  ),
                  child: officerState.isSubmittingFine
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('ISSUE CITATION'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
