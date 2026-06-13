import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/state/auth_provider.dart';
import '../../../core/theme/app_theme.dart';

class DriverLoginScreen extends ConsumerStatefulWidget {
  const DriverLoginScreen({super.key});

  @override
  ConsumerState<DriverLoginScreen> createState() => _DriverLoginScreenState();
}

class _DriverLoginScreenState extends ConsumerState<DriverLoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      final notifier = ref.read(authProvider.notifier);
      final success = await notifier.login(
        _usernameController.text.trim(),
        _passwordController.text,
      );

      if (success && mounted) {
        final authState = ref.read(authProvider);
        if (authState.role == 'DRIVER') {
          context.go('/driver/dashboard');
        } else {
          context.go('/officer/dashboard');
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 60.0),
              // Logo/Badge Icon
              Center(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.local_police,
                    size: 64,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ),
              const SizedBox(height: 24.0),
              // App Name & Headline
              Center(
                child: Text(
                  'eTFMS',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: AppTheme.primaryColor,
                        letterSpacing: 2,
                      ),
                ),
              ),
              const SizedBox(height: 8.0),
              Center(
                child: Text(
                  'eTraffic Fine Management System',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              const SizedBox(height: 60.0),

              Form(
                key: _formKey,
                child: Column(
                  children: [
                    // Username Field
                    TextFormField(
                      controller: _usernameController,
                      keyboardType: TextInputType.text,
                      textCapitalization: TextCapitalization.characters,
                      textInputAction: TextInputAction.next,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter your license ID';
                        }
                        return null;
                      },
                      decoration: const InputDecoration(
                        labelText: 'Driver / Police License ID',
                        prefixIcon: Icon(Icons.badge_outlined),
                      ),
                    ),
                    const SizedBox(height: 16.0),

                    // Password Field
                    TextFormField(
                      controller: _passwordController,
                      obscureText: true,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your password';
                        }
                        return null;
                      },
                      decoration: const InputDecoration(
                        labelText: 'Password',
                        prefixIcon: Icon(Icons.lock_outline),
                      ),
                    ),
                    const SizedBox(height: 24.0),

                    // Error Box
                    if (authState.error != null)
                      Container(
                        padding: const EdgeInsets.all(12.0),
                        decoration: BoxDecoration(
                          color: AppTheme.dangerColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.dangerColor.withOpacity(0.3)),
                        ),
                        child: Text(
                          authState.error!,
                          style: const TextStyle(color: AppTheme.dangerColor, fontSize: 13),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    const SizedBox(height: 24.0),

                    // Login Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: authState.isLoading ? null : _submit,
                        child: authState.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text('LOGIN'),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 40.0),
              // Register navigation
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Are you a driver? "),
                  GestureDetector(
                    onTap: () => context.push('/register'),
                    child: const Text(
                      'Register Here',
                      style: TextStyle(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.bold,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
