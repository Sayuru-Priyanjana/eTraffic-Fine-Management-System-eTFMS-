import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SessionManager {
  static const _storage = FlutterSecureStorage();

  static const _keyToken = 'jwt_token';
  static const _keyUserId = 'user_id';
  static const _keyUsername = 'username';
  static const _keyUserRole = 'user_role';

  /// Save session details upon successful login
  static Future<void> saveSession({
    required String token,
    required String id,
    required String username,
    required String role,
  }) async {
    await _storage.write(key: _keyToken, value: token);
    await _storage.write(key: _keyUserId, value: id);
    await _storage.write(key: _keyUsername, value: username);
    await _storage.write(key: _keyUserRole, value: role.toUpperCase());
  }

  /// Get current JWT token
  static Future<String?> getToken() async {
    return await _storage.read(key: _keyToken);
  }

  /// Get current User ID (Driver license or Police ID)
  static Future<String?> getUserId() async {
    return await _storage.read(key: _keyUserId);
  }

  /// Get current Username
  static Future<String?> getUsername() async {
    return await _storage.read(key: _keyUsername);
  }

  /// Get current User Role (DRIVER or POLICE_OFFICER or ADMIN)
  static Future<String?> getUserRole() async {
    return await _storage.read(key: _keyUserRole);
  }

  /// Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  /// Clear session data (Logout)
  static Future<void> clearSession() async {
    await _storage.delete(key: _keyToken);
    await _storage.delete(key: _keyUserId);
    await _storage.delete(key: _keyUsername);
    await _storage.delete(key: _keyUserRole);
  }
}
