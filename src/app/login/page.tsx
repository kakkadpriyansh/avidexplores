'use client';

import { useState, Suspense } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mountain, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background"><Navigation /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSendOTP = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'login' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      toast({
        title: "OTP Sent!",
        description: "Please check your email for the verification code.",
      });
      setOtpSent(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email,
        password: loginMethod === 'otp' ? otp : password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in to your account.",
        });
        const session = await getSession();
        const isAdmin = session?.user?.role === 'ADMIN';
        const goTo = isAdmin
          ? (callbackUrl.startsWith('/admin') ? callbackUrl : '/admin')
          : callbackUrl;
        router.push(goTo);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed Google login option

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-product-sans font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Sign in to your account to continue your adventure journey
              </p>
            </div>

            {/* Login Form */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle className="text-center font-product-sans">Sign In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Login Method Toggle */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('password');
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      loginMethod === 'password'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('otp');
                      setPassword('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      loginMethod === 'otp'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    OTP
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        required
                        placeholder="Enter your email"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {loginMethod === 'password' ? (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        OTP Code
                      </label>
                      <div className="space-y-2">
                        {!otpSent ? (
                          <Button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={isLoading || !email}
                            className="w-full"
                            variant="outline"
                          >
                            {isLoading ? 'Sending...' : 'Send OTP to Email'}
                          </Button>
                        ) : (
                          <>
                            <Input
                              type="text"
                              required
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            />
                            <Button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={isLoading}
                              variant="link"
                              className="text-xs w-full"
                            >
                              Resend OTP
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {loginMethod === 'password' && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-border" />
                        <span className="text-sm text-muted-foreground">Remember me</span>
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-primary hover:text-primary-glow transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || (loginMethod === 'otp' && (!otpSent || otp.length !== 6))}
                    className="btn-hero w-full"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                {/* Google login option removed */}

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link
                      href="/register"
                      className="text-primary hover:text-primary-glow transition-colors font-medium"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}