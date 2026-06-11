import 'package:flutter/material.dart';
import 'api_service.dart';
import 'payment_screen.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _refController = TextEditingController();
  final _categoryController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isLoading = false;

  void _searchFine() async {
    if (_refController.text.isEmpty || _categoryController.text.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      // Call Member 5's API logic
      final fineDetails = await _apiService.getFineDetails(
        _refController.text, 
        _categoryController.text
      );
      
      setState(() => _isLoading = false);
      
      // Navigate to Payment Screen with data
      if (fineDetails != null) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PaymentScreen(fineData: fineDetails),
          ),
        );
      }
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Fine not found. Please check your details.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Sri Lanka Police - eTraffic')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.network(
              'https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Sri_Lanka_Police_logo.svg/1200px-Sri_Lanka_Police_logo.svg.png',
              height: 100,
            ),
            SizedBox(height: 30),
            TextField(
              controller: _refController,
              decoration: InputDecoration(
                labelText: 'Fine Reference Number',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.receipt),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              controller: _categoryController,
              decoration: InputDecoration(
                labelText: 'Category Identifier (e.g. Speeding, Parking)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.category),
              ),
            ),
            SizedBox(height: 24),
            _isLoading 
              ? CircularProgressIndicator() 
              : ElevatedButton(
                  onPressed: _searchFine,
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size(double.infinity, 50),
                  ),
                  child: Text('Search Fine', style: TextStyle(fontSize: 18)),
                ),
          ],
        ),
      ),
    );
  }
}