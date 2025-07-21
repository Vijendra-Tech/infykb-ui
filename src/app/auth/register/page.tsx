"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Mail, Lock, User, Building, Globe, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useDexieAuthStore();
  
  const [registrationType, setRegistrationType] = useState<'create' | 'join'>('create');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationDomain: '',
    inviteCode: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (registrationType === 'create' && !formData.organizationName) {
      setError('Organization name is required');
      return;
    }

    if (registrationType === 'join' && !formData.inviteCode) {
      setError('Invite code is required');
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      organizationName: registrationType === 'create' ? formData.organizationName : undefined,
      organizationDomain: registrationType === 'create' ? formData.organizationDomain : undefined,
      inviteCode: registrationType === 'join' ? formData.inviteCode : undefined,
    });

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
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
            Get Started
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground mt-2"
          >
            Create your account or join an organization
          </motion.p>
        </div>

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Choose how you&apos;d like to get started
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Registration Type Tabs */}
                <Tabs value={registrationType} onValueChange={(value) => setRegistrationType(value as 'create' | 'join')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Create Organization
                    </TabsTrigger>
                    <TabsTrigger value="join" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Join Organization
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Information */}
                  <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

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

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
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

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Organization-specific fields */}
                  <TabsContent value="create" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName" className="text-sm font-medium">
                        Organization Name
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="organizationName"
                          type="text"
                          placeholder="Enter organization name"
                          value={formData.organizationName}
                          onChange={(e) => handleInputChange('organizationName', e.target.value)}
                          className="pl-10"
                          required={registrationType === 'create'}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationDomain" className="text-sm font-medium">
                        Organization Domain <span className="text-muted-foreground">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="organizationDomain"
                          type="text"
                          placeholder="example.com"
                          value={formData.organizationDomain}
                          onChange={(e) => handleInputChange('organizationDomain', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="join" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="inviteCode" className="text-sm font-medium">
                        Invite Code
                      </Label>
                      <div className="relative">
                        <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="inviteCode"
                          type="text"
                          placeholder="Enter invite code"
                          value={formData.inviteCode}
                          onChange={(e) => handleInputChange('inviteCode', e.target.value)}
                          className="pl-10"
                          required={registrationType === 'join'}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ask your organization admin for an invite code
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      {registrationType === 'create' ? 'Create Organization' : 'Join Organization'}
                    </div>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </form>
          </Card>
        </motion.div>

        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
