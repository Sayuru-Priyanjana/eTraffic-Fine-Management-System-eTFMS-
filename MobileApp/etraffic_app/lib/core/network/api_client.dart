import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../secure_storage/session_manager.dart';

class ApiClient {
  late final Dio _dio;

  static String get baseUrl {
    // Connect to the backend using your computer's local IP address
    // This allows physical devices on the same Wi-Fi network to access the API.
    return 'http://192.168.8.105:8080/api';
  }

  ApiClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Request & JWT interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SessionManager.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          // Auto logout on 401 Unauthorized
          if (error.response?.statusCode == 401) {
            await SessionManager.clearSession();
          }
          return handler.next(error);
        },
      ),
    );

    if (kDebugMode) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => debugPrint('API_LOG: $obj'),
      ));
    }
  }

  Dio get dio => _dio;
}

// Global single instance of ApiClient
final api = ApiClient();
