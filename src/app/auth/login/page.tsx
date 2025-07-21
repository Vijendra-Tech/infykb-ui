"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, RefreshCw } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { motion } from 'framer-motion';
import { db, initializeDatabase } from '@/lib/database';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useDexieAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate input before attempting login
    if (!formData.email?.trim() || !formData.password?.trim()) {
      setError('Please enter both email and password');
      return;
    }

    console.log('Login attempt:', { email: formData.email, password: formData.password });

    try {
      const result = await login({ 
        email: formData.email.trim(), 
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      console.log('Login result:', result);

      if (result?.success) {
        console.log('Login successful, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        // Handle different types of login failures gracefully
        const errorMessage = result?.error || 'Login failed. Please check your credentials and try again.';
        console.warn('Login failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      // Catch any unexpected errors to prevent UI breakage
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const resetDatabase = async () => {
    try {
      console.log('Resetting database...');
      await db.delete();
      await db.open();
      await initializeDatabase();
      console.log('Database reset complete');
      
      // Verify users were created
      const userCount = await db.users.count();
      const users = await db.users.toArray();
      console.log('Users created:', userCount, users.map(u => ({ email: u.email, role: u.role })));
      
      setError(`Database reset successfully. ${userCount} users created. Try logging in again.`);
    } catch (error) {
      console.error('Database reset failed:', error);
      setError('Database reset failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const checkDatabase = async () => {
    try {
      const userCount = await db.users.count();
      const users = await db.users.toArray();
      console.log('Current database state:', {
        userCount,
        users: users.map(u => ({ email: u.email, role: u.role, passwordLength: u.password?.length }))
      });
      setError(`Database has ${userCount} users. Check console for details.`);
    } catch (error) {
      console.error('Database check failed:', error);
      setError('Database check failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex justify-center mb-4"
          >
            <Logo size="lg" variant="default" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-bold text-foreground"
          >
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground mt-2"
          >
            Sign in to your account to continue
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                
                {/* Default Credentials Helper */}
                <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-muted-foreground">Test Credentials</h4>
                    <div className="flex gap-1">
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={checkDatabase}
                      >
                        Check DB
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={resetDatabase}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reset DB
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span>Admin:</span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, email: 'admin@example.com', password: 'admin123' }));
                        }}
                      >
                        admin@example.com / admin123
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Approver:</span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, email: 'approver@example.com', password: 'approver123' }));
                        }}
                      >
                        approver@example.com / approver123
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Member:</span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, email: 'member@example.com', password: 'member123' }));
                        }}
                      >
                        member@example.com / member123
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </div>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/register"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  );
}
