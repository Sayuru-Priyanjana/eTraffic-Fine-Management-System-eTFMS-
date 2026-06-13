import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/fine.dart';
import '../../../core/network/api_client.dart';
import '../../../core/state/auth_provider.dart';

class DriverFinesState {
  final List<Fine> fines;
  final bool isLoading;
  final String? error;
  final bool isSettling;

  DriverFinesState({
    this.fines = const [],
    this.isLoading = false,
    this.error,
    this.isSettling = false,
  });

  DriverFinesState copyWith({
    List<Fine>? fines,
    bool? isLoading,
    String? error,
    bool? isSettling,
  }) {
    return DriverFinesState(
      fines: fines ?? this.fines,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isSettling: isSettling ?? this.isSettling,
    );
  }
}

class DriverFinesNotifier extends StateNotifier<DriverFinesState> {
  final String? _driverId;

  DriverFinesNotifier(this._driverId) : super(DriverFinesState()) {
    fetchFines();
  }

  Future<void> fetchFines() async {
    if (_driverId == null) return;
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await api.dio.get('/fines/driver/$_driverId');
      if (response.statusCode == 200) {
        final list = (response.data as List)
            .map((item) => Fine.fromJson(item as Map<String, dynamic>))
            .toList();
        state = state.copyWith(fines: list, isLoading: false);
      } else {
        state = state.copyWith(isLoading: false, error: 'Failed to fetch fines');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Network or database error: $e');
    }
  }

  Future<bool> settleFine(int fineId) async {
    state = state.copyWith(isSettling: true, error: null);
    try {
      final response = await api.dio.post('/fines/$fineId/settle');
      if (response.statusCode == 200) {
        // Refresh fines list
        await fetchFines();
        return true;
      }
      state = state.copyWith(isSettling: false, error: 'Settlement failed');
      return false;
    } catch (e) {
      state = state.copyWith(isSettling: false, error: 'Settlement error: $e');
      return false;
    }
  }
}

final driverFinesProvider =
    StateNotifierProvider<DriverFinesNotifier, DriverFinesState>((ref) {
  final authState = ref.watch(authProvider);
  return DriverFinesNotifier(authState.userId);
});
