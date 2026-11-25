import 'dart:async';
import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart'; // Needed for kIsWeb
import 'package:firebase_core/firebase_core.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (kIsWeb) {
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: "AIzaSyDgG_4PdHvv5iU3NJ1cHtbuha70M5xKgJM",
        authDomain: "printease-8a246.firebaseapp.com",
        projectId: "printease-8a246",
        storageBucket: "printease-8a246.firebasestorage.app",
        messagingSenderId: "780521903624",
        appId: "1:780521903624:web:168b0aaf95a7ee791de3bd",
        measurementId: "G-75FSHNE94H",
      ),
    );
  } else {
    await Firebase.initializeApp();
  }

  runApp(const PrintEaseApp());
}

class PrintEaseApp extends StatelessWidget {
  const PrintEaseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PrintEase',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF283593),
        scaffoldBackgroundColor: const Color(0xFFF8F9FA),
      ),
      home: const SplashScreen(),
    );
  }
}

// Global state model for print order configuration
class PrintJobModel {
  static String fileName = "Document_Name.pdf";
  static String fileUrl = "";
  static int pageCount = 5;
  static bool isColor = false;
  static bool isDoubleSided = false;
  static String paperSize = 'A4';
  static int copies = 1;

  // Backend dynamic price map per page
  static double basePricePerPage = 2.0;
  static String activePin = "0000";

  static double get totalBasePrice => pageCount * basePricePerPage * copies;
  static double get convenienceFee => 1.0;
  static double get grandTotal => totalBasePrice + convenienceFee;
}

// Stubbed for successful compilation of navigation logic

// -----------------------------------------------------------------------------
// 1. Splash Screen
// -----------------------------------------------------------------------------
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF283593),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Card(
              elevation: 4,
              child: Padding(
                padding: EdgeInsets.all(24.0),
                child: Icon(
                  Icons.print_rounded,
                  size: 72,
                  color: Color(0xFF283593),
                ),
              ),
            ),
            SizedBox(height: 24),
            Text(
              'PrintEase',
              style: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'CARE Institute of Technology',
              style: TextStyle(
                fontSize: 14,
                color: Colors.white70,
                letterSpacing: 1.1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
// -----------------------------------------------------------------------------
// 2. Login Screen
// -----------------------------------------------------------------------------

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isLoggingIn = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // Login API
  // ---------------------------------------------------------------------------

  Future<void> _login() async {
    final phone = _phoneController.text.trim();
    final password = _passwordController.text;

    if (phone.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter mobile number and password'),
        ),
      );
      return;
    }

    setState(() {
      _isLoggingIn = true;
    });

    try {
      final response = await http.post(
        Uri.parse(
          'https://nastiness-pending-undertone.ngrok-free.dev/login',
        ),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: jsonEncode({
          'phone': phone,
          'password': password,
        }),
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        print("LOGIN RESPONSE: ${response.body}");
        print("USER DATA: ${data['user']}");

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Login successful!'),
          ),
        );

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (_) => MainNavigationShell(
              user: data['user'],
            ),
          ),
          (route) => false,
        );
      } else {
        final errorData = jsonDecode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              errorData['message'] ?? 'Login failed',
            ),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Connection error: $e',
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoggingIn = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Login to your Account'),
        leading: const Icon(Icons.lock_outline),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Welcome Back',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Enter your credentials to continue',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),

            // Mobile Number
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.badge_outlined),
                labelText: 'Enter mobile or register number',
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 16),

            // Password
            TextField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              decoration: InputDecoration(
                prefixIcon: const Icon(
                  Icons.lock_clock_outlined,
                ),
                labelText: 'Enter Password',
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off : Icons.visibility,
                  ),
                  onPressed: () {
                    setState(() {
                      _obscurePassword = !_obscurePassword;
                    });
                  },
                ),
              ),
            ),

            const SizedBox(height: 8),

            // Forgot Password
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                icon: const Icon(
                  Icons.help_outline,
                  size: 18,
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const PhoneAuthScreen(),
                    ),
                  );
                },
                label: const Text('Forgot Password?'),
              ),
            ),

            const SizedBox(height: 16),

            // Login Button
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: const Color(0xFF283593),
                foregroundColor: Colors.white,
              ),
              icon: _isLoggingIn
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.login),
              onPressed: _isLoggingIn ? null : _login,
              label: Text(
                _isLoggingIn ? 'Logging in...' : 'Login',
              ),
            ),

            const Spacer(),

            // Register
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("Don't have an account? "),
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const ProfileRegistrationScreen(),
                      ),
                    );
                  },
                  child: const Text(
                    'Register',
                    style: TextStyle(
                      color: Color(0xFF283593),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 3. Register Account Screen
// -----------------------------------------------------------------------------
class ProfileRegistrationScreen extends StatefulWidget {
  const ProfileRegistrationScreen({super.key});

  @override
  State<ProfileRegistrationScreen> createState() =>
      _ProfileRegistrationScreenState();
}

class _ProfileRegistrationScreenState extends State<ProfileRegistrationScreen> {
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _collegeidController = TextEditingController();
  final TextEditingController _deptController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  @override
  void dispose() {
    _fullNameController.dispose();
    _collegeidController.dispose();
    _deptController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: ListView(
          children: [
            const Text('Welcome to PrintEase',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text('Please set up your profile',
                style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 24),
            TextField(
              controller: _fullNameController,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.person_outline),
                labelText: 'Full name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _collegeidController,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.badge_outlined),
                labelText: 'College ID Number',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _deptController,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.school_outlined),
                labelText: 'Department',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.phone_outlined),
                labelText: 'Mobile Number',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: const Color(0xFF283593),
                foregroundColor: Colors.white,
              ),
              icon: const Icon(Icons.send_outlined),
              onPressed: () async {
                final phone = _phoneController.text.trim();

                if (phone.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Please enter mobile number'),
                    ),
                  );
                  return;
                }

                try {
                  final response = await http.post(
                    Uri.parse(
                      'https://nastiness-pending-undertone.ngrok-free.dev/send-otp',
                    ),
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: jsonEncode({
                      'phone': phone,
                    }),
                  );

                  if (!mounted) return;

                  if (response.statusCode == 200) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => OtpVerificationScreen(
                          phone: phone,
                          baseUrl:
                              'https://nastiness-pending-undertone.ngrok-free.dev',
                          name: _fullNameController.text.trim(),
                          collegeid: _collegeidController.text.trim(),
                          department: _deptController.text.trim(),
                        ),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Failed to send OTP: ${response.body}'),
                      ),
                    );
                  }
                } catch (e) {
                  if (!mounted) return;

                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Connection error: $e'),
                    ),
                  );
                }
              },
              label: const Text('Send OTP'),
            ),
          ],
        ),
      ),
    );
  }
}

class PhoneAuthScreen extends StatefulWidget {
  const PhoneAuthScreen({super.key});

  @override
  State<PhoneAuthScreen> createState() => _PhoneAuthScreenState();
}

class _PhoneAuthScreenState extends State<PhoneAuthScreen> {
  final TextEditingController _phoneController = TextEditingController();

  bool _isSending = false;

  final String baseUrl = 'https://nastiness-pending-undertone.ngrok-free.dev';

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    final phone = _phoneController.text.trim();

    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter mobile number'),
        ),
      );
      return;
    }

    setState(() {
      _isSending = true;
    });

    try {
      String enteredPhone = _phoneController.text.trim();
      String formattedPhone =
          enteredPhone.startsWith('+') ? enteredPhone : '+91$enteredPhone';

      await FirebaseAuth.instance.verifyPhoneNumber(
        phoneNumber: formattedPhone,
        verificationCompleted: (PhoneAuthCredential credential) async {
          await FirebaseAuth.instance.signInWithCredential(credential);
        },
        verificationFailed: (FirebaseAuthException e) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed: ${e.message}')),
          );
        },
        codeSent: (String verificationId, int? resendToken) {
          if (!mounted) return;
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => OtpVerificationScreen(
                baseUrl: baseUrl,
                phone: formattedPhone,
                name: '',
                collegeid: '',
                department: '',
                verificationId: verificationId,
              ),
            ),
          );
        },
        codeAutoRetrievalTimeout: (String verificationId) {},
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Connection error: $e'),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSending = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Login with Mobile'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Enter Mobile Number',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                hintText: '9999999999',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isSending ? null : _sendOtp,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: const Color(0xFF283593),
                foregroundColor: Colors.white,
              ),
              child: _isSending
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Send OTP'),
            ),
          ],
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 5. OTP Verification Screen (Firebase Integrated)
// -----------------------------------------------------------------------------
class OtpVerificationScreen extends StatefulWidget {
  final String phone;
  final String baseUrl;
  final String name;
  final String collegeid;
  final String department;
  final String verificationId; // Added to receive Firebase verification ID

  const OtpVerificationScreen({
    super.key,
    required this.phone,
    required this.baseUrl,
    required this.name,
    required this.collegeid,
    required this.department,
    this.verificationId = '', // Required from previous screen
  });

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final List<TextEditingController> _otpControllers = List.generate(
    6,
    (_) => TextEditingController(),
  );

  final FirebaseAuth _auth = FirebaseAuth.instance;
  bool _isVerifying = false;

  @override
  void dispose() {
    for (final controller in _otpControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _verifyOtp() async {
    final otp = _otpControllers.map((controller) => controller.text).join();

    if (otp.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter 6-digit OTP'),
        ),
      );
      return;
    }

    setState(() {
      _isVerifying = true;
    });

    try {
      // 1. Verify OTP with Firebase Auth
      PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: widget.verificationId,
        smsCode: otp,
      );

      UserCredential userCredential =
          await _auth.signInWithCredential(credential);

      if (!mounted) return;

      if (userCredential.user != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('OTP verified successfully'),
          ),
        );

        // 2. Navigate to your existing SetPasswordScreen
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => SetPasswordScreen(
              baseUrl: widget.baseUrl,
              phone: widget.phone,
              name: widget.name,
              collegeid: widget.collegeid,
              department: widget.department,
            ),
          ),
        );
      }
    } on FirebaseAuthException catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Invalid OTP: ${e.message ?? "Verification failed"}'),
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isVerifying = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verify Mobile'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Enter 6-Digit OTP',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'A code has been sent to ${widget.phone}',
              style: const TextStyle(
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(
                6,
                (index) {
                  return SizedBox(
                    width: 45,
                    child: TextField(
                      controller: _otpControllers[index],
                      textAlign: TextAlign.center,
                      keyboardType: TextInputType.number,
                      maxLength: 1,
                      decoration: const InputDecoration(
                        counterText: '',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) {
                        if (value.isNotEmpty && index < 5) {
                          FocusScope.of(context).nextFocus();
                        }
                      },
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: const Color(0xFF283593),
                foregroundColor: Colors.white,
              ),
              icon: _isVerifying
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(
                      Icons.verified_user_outlined,
                    ),
              onPressed: _isVerifying ? null : _verifyOtp,
              label: Text(
                _isVerifying ? 'Verifying...' : 'Verify & Continue',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 6. Set Password Screen
// -----------------------------------------------------------------------------
class SetPasswordScreen extends StatefulWidget {
  final String baseUrl;
  final String phone;
  final String name;
  final String collegeid;
  final String department;

  const SetPasswordScreen({
    super.key,
    required this.baseUrl,
    required this.phone,
    required this.name,
    required this.collegeid,
    required this.department,
  });

  @override
  State<SetPasswordScreen> createState() => _SetPasswordScreenState();
}

class _SetPasswordScreenState extends State<SetPasswordScreen> {
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _setPassword() async {
    final password = _passwordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (password.isEmpty || confirmPassword.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter both password fields'),
        ),
      );
      return;
    }

    if (password.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password must be at least 6 characters'),
        ),
      );
      return;
    }

    if (password != confirmPassword) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Passwords do not match'),
        ),
      );
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('${widget.baseUrl}/set-password'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'phone': widget.phone,
          'password': password,
          'name': widget.name,
          'collegeid': widget.collegeid,
          'department': widget.department,
        }),
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Password set successfully! Please log in.'),
          ),
        );

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (_) => const LoginScreen(),
          ),
          (route) => false,
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed: ${response.body}'),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Connection error: $e'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Set Password'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Create New Password',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Please choose a secure password for your account.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.lock_outline),
                labelText: 'Create new Password',
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off : Icons.visibility,
                  ),
                  onPressed: () {
                    setState(() {
                      _obscurePassword = !_obscurePassword;
                    });
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _confirmPasswordController,
              obscureText: _obscureConfirmPassword,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.lock_reset),
                labelText: 'Confirm Password',
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureConfirmPassword
                        ? Icons.visibility_off
                        : Icons.visibility,
                  ),
                  onPressed: () {
                    setState(() {
                      _obscureConfirmPassword = !_obscureConfirmPassword;
                    });
                  },
                ),
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: const Color(0xFF283593),
                foregroundColor: Colors.white,
              ),
              icon: const Icon(Icons.check_circle_outline),
              onPressed: _setPassword,
              label: const Text(
                'Set Password & Proceed to Login',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  final Map<String, dynamic>? user;

  const MainNavigationShell({
    super.key,
    this.user,
  });

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();

    _pages = [
      HomeDashboardScreen(user: widget.user),
      HistoryScreen(user: widget.user),
      ProfileScreen(user: widget.user),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) {
          setState(() {
            _currentIndex = idx;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.history_outlined),
            selectedIcon: Icon(Icons.history),
            label: 'History',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outlined),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
      floatingActionButton: _currentIndex == 0
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => FileUploadScreen(
                      user: widget.user!,
                    ),
                  ),
                );
              },
              icon: const Icon(Icons.add),
              label: const Text('New Print Job'),
              backgroundColor: const Color(0xFF283593),
              foregroundColor: Colors.white,
            )
          : null,
    );
  }
}

// -----------------------------------------------------------------------------
// 7. Home Dashboard Screen
// -----------------------------------------------------------------------------

class HomeDashboardScreen extends StatefulWidget {
  final Map<String, dynamic>? user;

  const HomeDashboardScreen({
    super.key,
    this.user,
  });

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  int totalPrints = 0;
  double totalSpent = 0.0;
  bool isLoading = true;

  // Store recent job details for THIS specific user
  Map<String, dynamic>? recentJob;

  final String baseUrl = 'https://nastiness-pending-undertone.ngrok-free.dev';

  Future<void> fetchUserStats() async {
    final userId = widget.user?['id'];

    if (userId == null) {
      if (mounted) setState(() => isLoading = false);
      return;
    }

    try {
      // 1. Fetch User Stats
      final statsResponse = await http.get(
        Uri.parse('$baseUrl/user-stats/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      );

      // 2. Fetch User Orders to get actual Recent Job
      final jobsResponse = await http.get(
        Uri.parse('$baseUrl/print-jobs/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      );

      if (!mounted) return;

      if (statsResponse.statusCode == 200) {
        final data = jsonDecode(statsResponse.body);
        setState(() {
          totalPrints = int.tryParse(data['total_prints'].toString()) ?? 0;
          totalSpent = double.tryParse(data['total_spent'].toString()) ?? 0.0;
        });
      }

      if (jobsResponse.statusCode == 200) {
        final List jobsData = jsonDecode(jobsResponse.body);
        setState(() {
          // Get the most recent job if list is not empty
          recentJob = jobsData.isNotEmpty ? jobsData.first : null;
          isLoading = false;
        });
      } else {
        setState(() => isLoading = false);
      }
    } catch (e) {
      print("Stats Error: $e");
      if (mounted) setState(() => isLoading = false);
    }
  }

  @override
  void initState() {
    super.initState();
    debugPrint("HomeDashboardScreen opened");
    fetchUserStats();
  }

  @override
  Widget build(BuildContext context) {
    // Read dynamic values from passed user Map or use fallback defaults
    final String studentName = widget.user?['name'] ?? 'Student';
    final String collegeid = widget.user?['collegeid'] ?? 'N/A';

    return Scaffold(
      appBar: AppBar(
        title: const Text('PrintEase'),
        leading: const Icon(Icons.print),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const PinDisplayScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: fetchUserStats,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ---------------------------------------------------------------
            // USER CARD (DYNAMIC DATA FROM DATABASE)
            // ---------------------------------------------------------------
            Card(
              color: const Color(0xFFE8EAF6),
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Color(0xFF283593),
                  child: Icon(
                    Icons.person,
                    color: Colors.white,
                  ),
                ),
                title: Text(
                  studentName,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                subtitle: Text(
                  'ADM NO: $collegeid',
                ),
              ),
            ),

            const SizedBox(height: 16),

            // ---------------------------------------------------------------
            // STATISTICS
            // ---------------------------------------------------------------
            Row(
              children: [
                // TOTAL PRINTS
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          const Icon(
                            Icons.print_outlined,
                            color: Color(0xFF283593),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Total Prints',
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 4),
                          isLoading
                              ? const SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : Text(
                                  '$totalPrints',
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ],
                      ),
                    ),
                  ),
                ),

                // TOTAL SPENT
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          const Icon(
                            Icons.account_balance_wallet_outlined,
                            color: Color(0xFF283593),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Total Spent',
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 4),
                          isLoading
                              ? const SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : Text(
                                  '₹${totalSpent.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // ---------------------------------------------------------------
            // MY ORDERS
            // ---------------------------------------------------------------
            // Inside HomeDashboardScreen build method:
            Card(
              child: ListTile(
                leading: const Icon(
                  Icons.receipt_long,
                  color: Color(0xFF283593),
                ),
                title: const Text(
                  'My Orders',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                subtitle: const Text(
                  'View all your print orders',
                ),
                trailing: const Icon(
                  Icons.arrow_forward_ios,
                  size: 18,
                ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => MyOrdersScreen(
                        user:
                            widget.user, // Pass the current logged-in user map
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Recent Jobs',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 10),

// Show Recent Job dynamically or empty state if User has no orders
            recentJob == null
                ? const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Center(
                        child: Text(
                          'No recent print jobs found.',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
                    ),
                  )
                : Card(
                    child: ListTile(
                      leading: const Icon(
                        Icons.picture_as_pdf,
                        color: Colors.redAccent,
                      ),
                      title: Text(
                        recentJob!['file_name'] ?? 'Document.pdf',
                      ),
                      subtitle: Text(
                        'PIN: ${recentJob!['pin']} • Status: ${recentJob!['print_status']}',
                      ),
                      trailing: Chip(
                        avatar: const Icon(
                          Icons.hourglass_empty,
                          size: 14,
                          color: Colors.orange,
                        ),
                        label: Text(
                          recentJob!['print_status']?.toUpperCase() ??
                              'WAITING',
                          style: const TextStyle(
                            color: Colors.orange,
                            fontSize: 11,
                          ),
                        ),
                        backgroundColor: const Color(0xFFFFF3E0),
                      ),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const PinDisplayScreen(),
                          ),
                        );
                      },
                    ),
                  ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'home_fab_tag',
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => FileUploadScreen(
                user: widget.user!,
              ),
            ),
          );
        },
        icon: const Icon(Icons.add),
        label: const Text('New Print Job'),
        backgroundColor: const Color(0xFF283593),
        foregroundColor: Colors.white,
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 8. Upload Document Screen
// -----------------------------------------------------------------------------
class FileUploadScreen extends StatefulWidget {
  final Map<String, dynamic> user;

  const FileUploadScreen({
    super.key,
    required this.user,
  });

  @override
  State<FileUploadScreen> createState() => _FileUploadScreenState();
}

class _FileUploadScreenState extends State<FileUploadScreen> {
  bool isFileSelected = false;
  Future<void> _simulateFilePick() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        withData: true,
      );

      if (result != null) {
        final file = result.files.single;

        setState(() {
          PrintJobModel.fileName = file.name;
          isFileSelected = true;
        });

        print("PDF selected: ${file.name}");

        await uploadPdfToBackend(file);
      }
    } catch (e) {
      print("PDF picker error: $e");
    }
  }

  Future<void> uploadPdfToBackend(PlatformFile file) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse(
          'https://nastiness-pending-undertone.ngrok-free.dev/upload-pdf',
        ),
      );
      request.fields['user_id'] = widget.user['id'].toString();
      request.files.add(
        http.MultipartFile.fromBytes(
          'pdf',
          file.bytes!,
          filename: file.name,
          contentType: MediaType('application', 'pdf'),
        ),
      );

      final response = await request.send();

      final responseBody = await response.stream.bytesToString();

      print("UPLOAD STATUS: ${response.statusCode}");
      print("UPLOAD RESPONSE: $responseBody");
      final data = jsonDecode(responseBody);

      PrintJobModel.fileName = data["file_name"];
      PrintJobModel.fileUrl = data["file_url"];
      print("SAVED FILE URL: ${PrintJobModel.fileUrl}");
    } catch (e) {
      print("UPLOAD ERROR: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Document'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: _simulateFilePick,
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade400, width: 2),
                    borderRadius: BorderRadius.circular(16),
                    color: Colors.grey.shade200,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        isFileSelected
                            ? Icons.insert_drive_file_rounded
                            : Icons.cloud_upload,
                        size: 64,
                        color: const Color(0xFF283593),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        isFileSelected
                            ? PrintJobModel.fileName
                            : 'Tap to select document',
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        isFileSelected
                            ? '${PrintJobModel.pageCount} Pages Loaded'
                            : 'Supports: PDF, DOCX (MAX 25MB)',
                        style:
                            const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: const Color(0xFF283593),
                foregroundColor: Colors.white,
              ),
              icon: const Icon(Icons.arrow_forward),
              onPressed: isFileSelected
                  ? () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => PrintSettingsScreen(
                            user: widget.user,
                          ),
                        ),
                      );
                    }
                  : null,
              label: const Text('Proceed with selected file'),
            ),
          ],
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 9. Print Options Screen (Case-Insensitive Database Match)
// -----------------------------------------------------------------------------
class PrintSettingsScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  const PrintSettingsScreen({
    super.key,
    required this.user,
  });

  @override
  State<PrintSettingsScreen> createState() => _PrintSettingsScreenState();
}

class _PrintSettingsScreenState extends State<PrintSettingsScreen> {
  List<dynamic> pricingData = [];
  bool isLoadingPricing = true;

  @override
  void initState() {
    super.initState();
    fetchPricingFromBackend();
  }

  // API Call: GET active ngrok URL
  Future<void> fetchPricingFromBackend() async {
    try {
      final response = await http.get(
        Uri.parse('https://nastiness-pending-undertone.ngrok-free.dev/pricing'),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          pricingData = jsonDecode(response.body);
          isLoadingPricing = false;
        });
        updateCurrentPrice();
      } else {
        setState(() => isLoadingPricing = false);
      }
    } catch (e) {
      print("Pricing fetch error: $e");
      setState(() => isLoadingPricing = false);
    }
  }

  void updateCurrentPrice() {
    if (pricingData.isEmpty) return;

    // Convert current user options to upper case for uniform comparisons
    String targetColorMode = PrintJobModel.isColor ? "COLOR" : "BW";
    String targetSide = PrintJobModel.isDoubleSided ? "DOUBLE" : "SINGLE";
    String targetSize = PrintJobModel.paperSize.trim().toUpperCase();

    final match = pricingData.firstWhere(
      (item) {
        // Convert DB fields to uppercase to ensure case-insensitive matching
        String dbSize =
            item['paper_size']?.toString().trim().toUpperCase() ?? '';
        String dbColor =
            item['color_mode']?.toString().trim().toUpperCase() ?? '';
        String dbSide =
            item['print_side']?.toString().trim().toUpperCase() ?? '';

        return dbSize == targetSize &&
            dbColor == targetColorMode &&
            dbSide == targetSide;
      },
      orElse: () => null,
    );

    if (match != null) {
      setState(() {
        PrintJobModel.basePricePerPage =
            double.parse(match['price_per_page'].toString());
      });
      print("Updated base price: ₹${PrintJobModel.basePricePerPage}");
    } else {
      print("No match found for: $targetSize | $targetColorMode | $targetSide");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Print Options'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: isLoadingPricing
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Row(
                  children: [
                    const Icon(Icons.picture_as_pdf, color: Colors.redAccent),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${PrintJobModel.fileName} (${PrintJobModel.pageCount} pages)',
                        style: const TextStyle(
                            fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 32),
                Row(
                  children: const [
                    Icon(Icons.palette_outlined, size: 20),
                    SizedBox(width: 8),
                    Text('Colour Mode',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        avatar: Icon(Icons.filter_b_and_w,
                            color: !PrintJobModel.isColor
                                ? Colors.white
                                : Colors.black),
                        label: const Center(child: Text('B&W')),
                        selected: !PrintJobModel.isColor,
                        onSelected: (val) {
                          setState(() => PrintJobModel.isColor = !val);
                          updateCurrentPrice();
                        },
                        selectedColor: const Color(0xFF283593),
                        labelStyle: TextStyle(
                            color: !PrintJobModel.isColor
                                ? Colors.white
                                : Colors.black),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ChoiceChip(
                        avatar: Icon(Icons.color_lens,
                            color: PrintJobModel.isColor
                                ? Colors.white
                                : Colors.black),
                        label: const Center(child: Text('Colour')),
                        selected: PrintJobModel.isColor,
                        onSelected: (val) {
                          setState(() => PrintJobModel.isColor = val);
                          updateCurrentPrice();
                        },
                        selectedColor: const Color(0xFF283593),
                        labelStyle: TextStyle(
                            color: PrintJobModel.isColor
                                ? Colors.white
                                : Colors.black),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  children: const [
                    Icon(Icons.flip_to_front, size: 20),
                    SizedBox(width: 8),
                    Text('Sides Printing',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        avatar: Icon(Icons.description,
                            color: !PrintJobModel.isDoubleSided
                                ? Colors.white
                                : Colors.black),
                        label: const Center(child: Text('Single-Side')),
                        selected: !PrintJobModel.isDoubleSided,
                        onSelected: (val) {
                          setState(() => PrintJobModel.isDoubleSided = !val);
                          updateCurrentPrice();
                        },
                        selectedColor: const Color(0xFF283593),
                        labelStyle: TextStyle(
                            color: !PrintJobModel.isDoubleSided
                                ? Colors.white
                                : Colors.black),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ChoiceChip(
                        avatar: Icon(Icons.menu_book,
                            color: PrintJobModel.isDoubleSided
                                ? Colors.white
                                : Colors.black),
                        label: const Center(child: Text('Double-Side')),
                        selected: PrintJobModel.isDoubleSided,
                        onSelected: (val) {
                          setState(() => PrintJobModel.isDoubleSided = val);
                          updateCurrentPrice();
                        },
                        selectedColor: const Color(0xFF283593),
                        labelStyle: TextStyle(
                            color: PrintJobModel.isDoubleSided
                                ? Colors.white
                                : Colors.black),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  children: const [
                    Icon(Icons.aspect_ratio, size: 20),
                    SizedBox(width: 8),
                    Text('Paper Size',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        label: const Center(child: Text('A4')),
                        selected: PrintJobModel.paperSize == 'A4',
                        onSelected: (val) {
                          setState(() => PrintJobModel.paperSize = 'A4');
                          updateCurrentPrice();
                        },
                        selectedColor: const Color(0xFF283593),
                        labelStyle: TextStyle(
                            color: PrintJobModel.paperSize == 'A4'
                                ? Colors.white
                                : Colors.black),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ChoiceChip(
                        label: const Center(child: Text('A3')),
                        selected: PrintJobModel.paperSize == 'A3',
                        onSelected: (val) {
                          setState(() => PrintJobModel.paperSize = 'A3');
                          updateCurrentPrice();
                        },
                        selectedColor: const Color(0xFF283593),
                        labelStyle: TextStyle(
                            color: PrintJobModel.paperSize == 'A3'
                                ? Colors.white
                                : Colors.black),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.copy, size: 20),
                        SizedBox(width: 8),
                        Text('No. of copies',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline),
                          onPressed: PrintJobModel.copies > 1
                              ? () => setState(() => PrintJobModel.copies--)
                              : null,
                        ),
                        Text('${PrintJobModel.copies}',
                            style: const TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold)),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline),
                          onPressed: () =>
                              setState(() => PrintJobModel.copies++),
                        ),
                      ],
                    )
                  ],
                ),
                const SizedBox(height: 32),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size.fromHeight(50),
                    backgroundColor: const Color(0xFF283593),
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.calculate_outlined),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => BillSummaryScreen(
                                user: widget.user,
                              )),
                    );
                  },
                  label: const Text('Calculate & summary'),
                ),
              ],
            ),
    );
  }
}

// -----------------------------------------------------------------------------
// 10. Bill Details Screen
// -----------------------------------------------------------------------------
class BillSummaryScreen extends StatelessWidget {
  final Map<String, dynamic> user;
  const BillSummaryScreen({
    super.key,
    required this.user,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bill Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                              'Base Price (${PrintJobModel.pageCount} pages @ ₹${PrintJobModel.basePricePerPage})'),
                        ),
                        Text(
                            '₹${PrintJobModel.totalBasePrice.toStringAsFixed(2)}'),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Paper Size (${PrintJobModel.paperSize})'),
                        const Text('₹0.00'),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Convenience Fee'),
                        Text(
                            '₹${PrintJobModel.convenienceFee.toStringAsFixed(2)}'),
                      ],
                    ),
                    const Divider(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Payable',
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 18)),
                        Text(
                          '₹${PrintJobModel.grandTotal.toStringAsFixed(2)}',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: Color(0xFF283593)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const Spacer(),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: const Color(0xFF283593),
                foregroundColor: Colors.white,
              ),
              icon: const Icon(Icons.payment),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => PaymentScreen(
                            user: user,
                          )),
                );
              },
              label: const Text('Proceed to Payment'),
            ),
          ],
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 11. Payment Gateway Screen
// -----------------------------------------------------------------------------
class PaymentScreen extends StatefulWidget {
  final Map<String, dynamic>? user;
  const PaymentScreen({
    super.key,
    required this.user,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedOption = 'UPI';
  bool _isProcessing = false;

  Future<void> _processPaymentAndSubmitOrder() async {
    setState(() => _isProcessing = true);

    try {
      final response = await http.post(
        Uri.parse(
          'https://nastiness-pending-undertone.ngrok-free.dev/print-jobs',
        ),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'user_id': widget.user!['id'],
          'file_name': PrintJobModel.fileName,
          'file_url': PrintJobModel.fileUrl,
          'page_count': PrintJobModel.pageCount,
          // Match standard uppercase casing expected by DB
          'color_mode': PrintJobModel.isColor ? 'COLOR' : 'BW',
          'print_side': PrintJobModel.isDoubleSided ? 'DOUBLE' : 'SINGLE',
          'paper_size': PrintJobModel.paperSize.toUpperCase(),
          'copies': PrintJobModel.copies,
          'total_amount':
              PrintJobModel.grandTotal, // Pass total amount explicitly
        }),
      );

      print("PRINT JOB STATUS: ${response.statusCode}");
      print("PRINT JOB RESPONSE: ${response.body}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);

        // Save PIN safely
        if (responseData['print_job'] != null &&
            responseData['print_job']['pin'] != null) {
          PrintJobModel.activePin = responseData['print_job']['pin'].toString();
        }

        if (!mounted) return;

        // Navigate to PIN screen cleanly (Single call)
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (_) => PinDisplayScreen(user: widget.user),
          ),
          (route) =>
              route.isFirst, // Pops all intermediate screens back to home
        );
      } else {
        throw Exception('Server returned ${response.statusCode}');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Payment failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Amount to Pay: ₹${PrintJobModel.grandTotal.toStringAsFixed(2)}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            RadioListTile<String>(
              secondary: const Icon(Icons.qr_code),
              title: const Text('UPI / Google Pay / PhonePe'),
              value: 'UPI',
              groupValue: _selectedOption,
              onChanged: (val) => setState(() => _selectedOption = val!),
            ),
            RadioListTile<String>(
              secondary: const Icon(Icons.credit_card),
              title: const Text('Credit / Debit Card'),
              value: 'Card',
              groupValue: _selectedOption,
              onChanged: (val) => setState(() => _selectedOption = val!),
            ),
            RadioListTile<String>(
              secondary: const Icon(Icons.account_balance),
              title: const Text('Net Banking'),
              value: 'NetBanking',
              groupValue: _selectedOption,
              onChanged: (val) => setState(() => _selectedOption = val!),
            ),
            const Spacer(),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: const Color(0xFF283593),
                foregroundColor: Colors.white,
              ),
              icon: _isProcessing
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2),
                    )
                  : const Icon(Icons.lock),
              onPressed: _isProcessing ? null : _processPaymentAndSubmitOrder,
              label: Text(_isProcessing ? 'Processing...' : 'Pay Now'),
            ),
          ],
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 12. Display PIN / QR Code Screen
// -----------------------------------------------------------------------------
class PinDisplayScreen extends StatelessWidget {
  final Map<String, dynamic>? user;
  const PinDisplayScreen({
    super.key,
    this.user,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Order Confirmed'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.check_circle_outline,
                size: 80, color: Colors.green),
            const SizedBox(height: 16),
            const Text(
              'Print Order Submitted!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Use this PIN at the campus kiosk printer to collect your document.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            Card(
              elevation: 4,
              color: const Color(0xFFE8EAF6),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: [
                    const Text('YOUR SECRET PRINT PIN',
                        style: TextStyle(
                            color: Colors.grey,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2)),
                    const SizedBox(height: 8),
                    Text(
                      PrintJobModel.activePin.split('').join(' '),
                      style: const TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 8,
                          color: Color(0xFF283593)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: const Color(0xFF283593),
                foregroundColor: Colors.white,
              ),
              icon: const Icon(Icons.home),
              onPressed: () {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const MainNavigationShell()),
                  (route) => false,
                );
              },
              label: const Text('Back to Home'),
            ),
          ],
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 13. Print History / Orders Screen
// -----------------------------------------------------------------------------
class HistoryScreen extends StatefulWidget {
  final Map<String, dynamic>? user;
  const HistoryScreen({
    super.key,
    this.user,
  });

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<dynamic> orders = [];
  bool isLoading = true;
  final String baseUrl = 'https://nastiness-pending-undertone.ngrok-free.dev';
  Timer? _orderTimer;

  @override
  void initState() {
    super.initState();
    fetchOrders();
    _orderTimer = Timer.periodic(
      const Duration(seconds: 5),
      (timer) {
        fetchOrders();
      },
    );
  }

  Future<void> fetchOrders() async {
    try {
      final user_id = widget.user?['id'];
      if (user_id == null) {
        print("User ID not found");
        setState(() {
          isLoading = false;
        });
        return;
      }
      debugPrint("Api URL = $baseUrl/print-jobs/${widget.user?['id']}");
      final response = await http.get(
        Uri.parse('$baseUrl/print-jobs/$user_id'),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      );

      print("Response Status Code: ${response.statusCode}");
      print("Response Body: ${response.body}");
      if (!mounted) return;
      setState(() {
        isLoading = false;
      });
      if (response.statusCode == 200) {
        setState(() {
          orders = jsonDecode(response.body);
          isLoading = false;
        });
      } else {
        setState(() {
          isLoading = false;
        });
      }
    } catch (e) {
      print("History error details: $e");
      setState(() {
        isLoading = false;
      });
    }
  }

  Widget _statusStep({
    required IconData icon,
    required String title,
    required bool active,
  }) {
    return Column(
      children: [
        Icon(
          icon,
          color: active ? Colors.green : Colors.grey,
          size: 24,
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: TextStyle(
            fontSize: 11,
            color: active ? Colors.green : Colors.grey,
            fontWeight: active ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Print History'),
        leading: const Icon(Icons.history),
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : orders.isEmpty
              ? const Center(
                  child: Text('No print orders found'),
                )
              : RefreshIndicator(
                  onRefresh: fetchOrders,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: orders.length,
                    itemBuilder: (context, index) {
                      final order = orders[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(
                                    Icons.picture_as_pdf,
                                    color: Colors.redAccent,
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      order['file_name'] ?? 'Unknown File',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Pages: ${order['page_count']} • '
                                'Copies: ${order['copies']}\n'
                                'PIN: ${order['pin']}\n'
                                'Total: ₹${order['total_amount']}\n'
                                'Payment: ${order['payment_status'] ?? 'pending'}',
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Order Status',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  _statusStep(
                                    icon: Icons.payment,
                                    title: 'Payment',
                                    active: order['payment_status'] == 'paid',
                                  ),
                                  Expanded(
                                    child: Container(
                                      height: 2,
                                      color:
                                          order['print_status'] == 'printing' ||
                                                  order['print_status'] ==
                                                      'completed'
                                              ? Colors.green
                                              : Colors.grey,
                                    ),
                                  ),
                                  _statusStep(
                                    icon: Icons.print,
                                    title: 'Printing',
                                    active: order['print_status'] ==
                                            'printing' ||
                                        order['print_status'] == 'completed',
                                  ),
                                  Expanded(
                                    child: Container(
                                      height: 2,
                                      color:
                                          order['print_status'] == 'completed'
                                              ? Colors.green
                                              : Colors.grey,
                                    ),
                                  ),
                                  _statusStep(
                                    icon: Icons.check_circle,
                                    title: 'Completed',
                                    active:
                                        order['print_status'] == 'completed',
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  @override
  void dispose() {
    _orderTimer?.cancel();
    super.dispose();
  }
}
// -----------------------------------------------------------------------------
// 14. User Profile Screen
// -----------------------------------------------------------------------------

class ProfileScreen extends StatelessWidget {
  final Map<String, dynamic>? user;

  const ProfileScreen({
    super.key,
    this.user,
  });

  @override
  Widget build(BuildContext context) {
    final String name = user?['name']?.toString() ?? 'Student';

    final String collegeid = user?['collegeid']?.toString() ?? 'Not available';

    final String department =
        user?['department']?.toString() ?? 'Not available';

    final String phone = user?['phone']?.toString() ?? 'Not available';

    // Mask phone number
    String maskedPhone = phone;

    if (phone.length >= 10) {
      maskedPhone =
          '${phone.substring(0, 2)}XXXXXX${phone.substring(phone.length - 2)}';
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        leading: const Icon(Icons.person),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile Icon
          const Center(
            child: CircleAvatar(
              radius: 40,
              backgroundColor: Color(0xFF283593),
              child: Icon(
                Icons.person,
                size: 48,
                color: Colors.white,
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Name
          Center(
            child: Text(
              name,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          const SizedBox(height: 4),

          // College / Admission Number
          Center(
            child: Text(
              'ADM NO: $collegeid',
              style: const TextStyle(
                color: Colors.grey,
              ),
            ),
          ),

          const SizedBox(height: 32),

          // Department
          ListTile(
            leading: const Icon(Icons.school),
            title: const Text('Department'),
            subtitle: Text(department),
          ),

          // Mobile
          ListTile(
            leading: const Icon(Icons.phone),
            title: const Text('Mobile'),
            subtitle: Text(maskedPhone),
          ),

          const Divider(),

          const SizedBox(height: 8),

          // Logout
          ListTile(
            leading: const Icon(
              Icons.logout,
              color: Colors.red,
            ),
            title: const Text(
              'Logout',
              style: TextStyle(
                color: Colors.red,
              ),
            ),
            onTap: () {
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(
                  builder: (_) => const LoginScreen(),
                ),
                (route) => false,
              );
            },
          ),
        ],
      ),
    );
  }
}

class MyOrdersScreen extends StatefulWidget {
  final Map<String, dynamic>? user;

  const MyOrdersScreen({
    super.key,
    this.user,
  });

  @override
  State<MyOrdersScreen> createState() => _MyOrdersScreenState();
}

class _MyOrdersScreenState extends State<MyOrdersScreen> {
  List<dynamic> orders = [];
  bool isLoading = true;

  Future<void> fetchMyOrders() async {
    final userId = widget.user?['id'];

    if (userId == null) {
      if (mounted) setState(() => isLoading = false);
      return;
    }

    try {
      final response = await http.get(
        // Dynamic URL based on logged-in user's ID
        Uri.parse(
            'https://nastiness-pending-undertone.ngrok-free.dev/print-jobs/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      );

      if (response.statusCode == 200) {
        if (!mounted) return;
        setState(() {
          orders = jsonDecode(response.body);
          isLoading = false;
        });
      } else {
        if (!mounted) return;
        setState(() => isLoading = false);
      }
    } catch (e) {
      print("History error: $e");
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  @override
  void initState() {
    super.initState();
    fetchMyOrders();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("My Orders"),
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : orders.isEmpty
              ? const Center(
                  child: Text("No orders found"),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: orders.length,
                  itemBuilder: (context, index) {
                    final order = orders[index];

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              order["file_name"] ?? "Unknown file",
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text("Order ID: ${order["id"]}"),
                            Text("Pages: ${order["page_count"]}"),
                            Text("Copies: ${order["copies"]}"),
                            Text("Total: ₹${order["total_amount"]}"),
                            Text("Payment: ${order["payment_status"]}"),
                            Text("Print Status: ${order["print_status"]}"),
                            Text("PIN: ${order["pin"]}"),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
