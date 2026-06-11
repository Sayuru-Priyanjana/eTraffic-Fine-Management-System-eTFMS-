import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Replace with your computer's IP address if testing on a physical device, 
  // or 10.0.2.2 if testing on Android Emulator
  static const String baseUrl = 'http://10.0.2.2:8080/api'; 

  // Helper to get JWT Token
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }
//the workings
  // 1. Fetch Fine Details
  Future<Map<String, dynamic>?> getFineDetails(String refNumber, String categoryId) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/fines/$refNumber/category/$categoryId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token', // JWT injected here
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load fine details');
    }
  }

  // 2. Process Payment
  Future<bool> payFine(String refNumber, Map<String, dynamic> paymentDetails) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/fines/$refNumber/pay'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(paymentDetails),
    );

    // Assuming backend returns 200 OK and triggers SMS internally
    return response.statusCode == 200; 
  }
}