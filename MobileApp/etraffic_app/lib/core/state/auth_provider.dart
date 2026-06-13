import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import '../../core/secure_storage/session_manager.dart';

class AuthState {
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;
  final String? role;
  final String? userId;
  final String? username;

  AuthState({
    this.isLoading = false,
    this.error,
    this.isAuthenticated = false,
    this.role,
    this.userId,
    this.username,
  });

  AuthState copyWith({
    bool? isLoading,
    String? error,
    bool? isAuthenticated,
    String? role,
    String? userId,
    String? username,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error, // Clear error if not passed
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      role: role ?? this.role,
      userId: userId ?? this.userId,
      username: username ?? this.username,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final loggedIn = await SessionManager.isLoggedIn();
    if (loggedIn) {
      final role = await SessionManager.getUserRole();
      final id = await SessionManager.getUserId();
      final username = await SessionManager.getUsername();
      state = AuthState(
        isAuthenticated: true,
        role: role,
        userId: id,
        username: username,
      );
    }
  }

  Future<bool> login(String username, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await api.dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['token'] as String;
        final id = data['id'] as String;
        final name = data['username'] as String;
        final role = data['role'] as String;

        await SessionManager.saveSession(
          token: token,
          id: id,
          username: name,
          role: role,
        );

        state = AuthState(
          isAuthenticated: true,
          role: role.toUpperCase(),
          userId: id,
          username: name,
        );
        return true;
      } else {
        state = state.copyWith(isLoading: false, error: 'Login failed');
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().contains('401')
            ? 'Invalid username or password'
            : 'Network connection failed',
      );
      return false;
    }
  }

  Future<bool> register({
    required String id,
    required String username,
    required String password,
    required String role,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await api.dio.post('/auth/register', data: {
        'id': id,
        'username': username,
        'password': password,
        'role': role.toUpperCase(),
      });

      if (response.statusCode == 200) {
        // Automatically login after successful registration
        return await login(username, password);
      } else {
        state = state.copyWith(isLoading: false, error: 'Registration failed');
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Registration failed: ${e.toString()}',
      );
      return false;
    }
  }

  Future<void> logout() async {
    await SessionManager.clearSession();
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
