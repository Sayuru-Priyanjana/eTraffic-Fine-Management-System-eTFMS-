import 'package:flutter/material.dart';
import 'api_service.dart';

class PaymentScreen extends StatefulWidget {
  final Map<String, dynamic> fineData;

  PaymentScreen({required this.fineData});

  @override
  _PaymentScreenState createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final ApiService _apiService = ApiService();
  bool _isProcessing = false;

  void _processPayment() async {
    setState(() => _isProcessing = true);
    
    // Mock Payment Details to send to backend
    Map<String, dynamic> mockPayment = {
      "amount": widget.fineData['amount'],
      "paymentMethod": "CREDIT_CARD",
      "status": "SUCCESS"
    };

    try {
      bool success = await _apiService.payFine(widget.fineData['referenceNumber'], mockPayment);
      setState(() => _isProcessing = false);

      if (success) {
        _showSuccessDialog();
      }
    } catch (e) {
      setState(() => _isProcessing = false);
       ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Payment Failed!')),
      );
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text('Payment Successful'),
        content: Text('Your fine has been settled. An SMS notification has been sent to the officer.'),
        actions: [
          TextButton(
            onPressed: () {
              // Pop back to the very first screen
              Navigator.of(context).popUntil((route) => route.isFirst);
            },
            child: Text('OK'),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Settle Fine')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Fine Details', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            Divider(),
            ListTile(
              title: Text('Reference No'),
              subtitle: Text(widget.fineData['referenceNumber'] ?? 'N/A'),
            ),
            ListTile(
              title: Text('Violation'),
              subtitle: Text(widget.fineData['violationType'] ?? 'N/A'),
            ),
            ListTile(
              title: Text('Amount to Pay'),
              subtitle: Text('LKR ${widget.fineData['amount']}', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
            ),
            Spacer(),
            _isProcessing
                ? Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _processPayment,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      minimumSize: Size(double.infinity, 50),
                    ),
                    child: Text('Pay Now', style: TextStyle(fontSize: 18, color: Colors.white)),
                  ),
            SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}