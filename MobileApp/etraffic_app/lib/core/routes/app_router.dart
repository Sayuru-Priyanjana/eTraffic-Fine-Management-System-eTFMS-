import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../secure_storage/session_manager.dart';

// Screens
import '../../features/driver/screens/driver_login_screen.dart';
import '../../features/driver/screens/driver_register_screen.dart';
import '../../features/driver/screens/driver_dashboard_screen.dart';
import '../../features/driver/screens/fine_detail_screen.dart';
import '../../features/officer/screens/officer_dashboard_screen.dart';
import '../../features/officer/screens/issue_fine_screen.dart';
import '../../features/officer/screens/search_driver_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  redirect: (BuildContext context, GoRouterState state) async {
    final loggedIn = await SessionManager.isLoggedIn();
    final role = await SessionManager.getUserRole();

    final isAuthRoute = state.matchedLocation == '/login' || state.matchedLocation == '/register';

    // 1. Not logged in: must be redirected to /login (unless already on login or register)
    if (!loggedIn) {
      return isAuthRoute ? null : '/login';
    }

    // 2. Logged in and trying to access /login or /register: redirect to dashboard
    if (isAuthRoute) {
      if (role == 'DRIVER') {
        return '/driver/dashboard';
      } else if (role == 'POLICE_OFFICER' || role == 'ADMIN') {
        return '/officer/dashboard';
      }
    }

    // 3. Prevent Driver from entering Officer screens
    if (state.matchedLocation.startsWith('/officer') && role != 'POLICE_OFFICER' && role != 'ADMIN') {
      return '/driver/dashboard';
    }

    // 4. Prevent Officer from entering Driver screens
    if (state.matchedLocation.startsWith('/driver') && role != 'DRIVER') {
      return '/officer/dashboard';
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const DriverLoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const DriverRegisterScreen(),
    ),
    
    // Driver Module Routes
    GoRoute(
      path: '/driver/dashboard',
      builder: (context, state) => const DriverDashboardScreen(),
    ),
    GoRoute(
      path: '/driver/fine/:id',
      builder: (context, state) {
        final fineId = int.parse(state.pathParameters['id']!);
        // We can pass arguments if needed, otherwise read from path parameter
        return FineDetailScreen(fineId: fineId);
      },
    ),

    // Officer Module Routes
    GoRoute(
      path: '/officer/dashboard',
      builder: (context, state) => const OfficerDashboardScreen(),
    ),
    GoRoute(
      path: '/officer/issue',
      builder: (context, state) => const IssueFineScreen(),
    ),
    GoRoute(
      path: '/officer/search',
      builder: (context, state) => const SearchDriverScreen(),
    ),
  ],
);
