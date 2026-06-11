import 'package:flutter/material.dart';
// Make sure this matches the exact name of the file you created for the home screen
import 'home_screen.dart'; 

void main() {
  // This is the function that actually starts your app
  runApp(const ETrafficApp());
}

class ETrafficApp extends StatelessWidget {
  const ETrafficApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'eTraffic Fine System',
      debugShowCheckedModeBanner: false, // Removes the "DEBUG" banner
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      // This tells the app to load your custom home screen first
      home: HomeScreen(), 
    );
  }
}