import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/fine.dart';
import '../../../core/models/fine_category.dart';
import '../../../core/network/api_client.dart';
import '../../../core/state/auth_provider.dart';

class OfficerState {
  final List<Fine> issuedFines;
  final List<FineCategory> categories;
  final bool isLoadingFines;
  final bool isLoadingCategories;
  final bool isSubmittingFine;
  final String? error;

  OfficerState({
    this.issuedFines = const [],
    this.categories = const [],
    this.isLoadingFines = false,
    this.isLoadingCategories = false,
    this.isSubmittingFine = false,
    this.error,
  });

  OfficerState copyWith({
    List<Fine>? issuedFines,
    List<FineCategory>? categories,
    bool? isLoadingFines,
    bool? isLoadingCategories,
    bool? isSubmittingFine,
    String? error,
  }) {
    return OfficerState(
      issuedFines: issuedFines ?? this.issuedFines,
      categories: categories ?? this.categories,
      isLoadingFines: isLoadingFines ?? this.isLoadingFines,
      isLoadingCategories: isLoadingCategories ?? this.isLoadingCategories,
      isSubmittingFine: isSubmittingFine ?? this.isSubmittingFine,
      error: error,
    );
  }
}

class OfficerNotifier extends StateNotifier<OfficerState> {
  final String? _officerId;

  OfficerNotifier(this._officerId) : super(OfficerState()) {
    fetchCategories();
    fetchIssuedFines();
  }

  Future<void> fetchCategories() async {
    state = state.copyWith(isLoadingCategories: true, error: null);
    try {
      final response = await api.dio.get('/categories');
      if (response.statusCode == 200) {
        final list = (response.data as List)
            .map((item) => FineCategory.fromJson(item as Map<String, dynamic>))
            .toList();
        state = state.copyWith(categories: list, isLoadingCategories: false);
      } else {
        state = state.copyWith(isLoadingCategories: false, error: 'Failed to fetch categories');
      }
    } catch (e) {
      state = state.copyWith(isLoadingCategories: false, error: 'Error loading categories: $e');
    }
  }

  Future<void> fetchIssuedFines() async {
    if (_officerId == null) return;
    state = state.copyWith(isLoadingFines: true, error: null);
    try {
      final response = await api.dio.get('/fines/officer/$_officerId');
      if (response.statusCode == 200) {
        final list = (response.data as List)
            .map((item) => Fine.fromJson(item as Map<String, dynamic>))
            .toList();
        state = state.copyWith(issuedFines: list, isLoadingFines: false);
      } else {
        state = state.copyWith(isLoadingFines: false, error: 'Failed to fetch issued fines');
      }
    } catch (e) {
      state = state.copyWith(isLoadingFines: false, error: 'Error loading issued fines: $e');
    }
  }

  Future<Fine?> issueFine({
    required int categoryId,
    required String driverId,
    required DateTime dueDate,
  }) async {
    state = state.copyWith(isSubmittingFine: true, error: null);
    try {
      final response = await api.dio.post('/fines', data: {
        'categoryId': categoryId,
        'driverId': driverId,
        'dueDate': dueDate.toIso8601String(),
      });

      if (response.statusCode == 201 || response.statusCode == 200) {
        final fine = Fine.fromJson(response.data as Map<String, dynamic>);
        state = state.copyWith(isSubmittingFine: false);
        // Refresh issued list
        await fetchIssuedFines();
        return fine;
      }
      state = state.copyWith(isSubmittingFine: false, error: 'Failed to issue fine');
      return null;
    } catch (e) {
      state = state.copyWith(isSubmittingFine: false, error: 'Error issuing fine: $e');
      return null;
    }
  }

  Future<bool> cancelOrUpdateFine(int fineId, {required String status}) async {
    state = state.copyWith(isSubmittingFine: true, error: null);
    try {
      // Find the existing fine details
      final existingFine = state.issuedFines.firstWhere((f) => f.id == fineId);
      
      final response = await api.dio.put('/fines/$fineId', data: {
        'categoryId': existingFine.categoryId,
        'driverId': existingFine.driverId,
        'dueDate': existingFine.dueDate.toIso8601String(),
        'status': status,
      });

      if (response.statusCode == 200) {
        state = state.copyWith(isSubmittingFine: false);
        await fetchIssuedFines();
        return true;
      }
      state = state.copyWith(isSubmittingFine: false, error: 'Failed to update status');
      return false;
    } catch (e) {
      state = state.copyWith(isSubmittingFine: false, error: 'Error updating fine: $e');
      return false;
    }
  }
}

final officerProvider =
    StateNotifierProvider<OfficerNotifier, OfficerState>((ref) {
  final authState = ref.watch(authProvider);
  return OfficerNotifier(authState.userId);
});
