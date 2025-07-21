
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Database, 
  Users, 
  Zap, 
  Shield, 
  BarChart3, 
  ArrowRight, 
  Sparkles, 
  Globe, 
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Activity
} from "lucide-react";
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user } = useDexieAuthStore();
  const router = useRouter();

  // Platform stats (could be fetched from API in real implementation)
  const platformStats = {
    totalProjects: 1247,
    activeUsers: 8934,
    knowledgeArticles: 45672,
    apiCalls: 2847293,
    uptime: 99.9,
    responseTime: 45
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Knowledge Base",
      description: "Intelligent content organization with advanced search and AI-driven insights",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Database,
      title: "Scalable Data Management",
      description: "Enterprise-grade data storage with real-time synchronization",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Role-based access control with enterprise security standards",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast Performance",
      description: "Optimized for speed with sub-50ms response times",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-6 md:p-8"
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                InfinityKB
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {user.role === 'admin' ? 'Admin' : user.role === 'super_admin' ? 'Super Admin' : user.role === 'approver' ? 'Approver' : 'Member'}
                  </Badge>
                  <Button onClick={() => router.push('/dashboard')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => router.push('/auth/login')}>
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-6 md:px-8 pb-16">
          {/* Hero Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center py-16 md:py-24"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center mb-6"
              >
                <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300 px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Next-Generation Knowledge Management
                </Badge>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  Infinite Knowledge,
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Boundless Possibilities
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Harness the power of AI-driven knowledge management with enterprise-grade security, 
                lightning-fast performance, and intuitive collaboration tools.
              </p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
              >
                <Button 
                  onClick={handleGetStarted}
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {user ? 'Go to Dashboard' : 'Start Your Journey'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-4 text-lg font-semibold border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => router.push('/features')}
                >
                  Explore Features
                  <Globe className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
            </div>
          </motion.section>

          {/* Platform Stats */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="py-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Platform at a Glance
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Real-time insights into our growing knowledge ecosystem
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="relative overflow-hidden backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +23%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {platformStats.totalProjects.toLocaleString()}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">Active Projects</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Across all organizations</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Card className="relative overflow-hidden backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <Activity className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {platformStats.activeUsers.toLocaleString()}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">Active Users</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Monthly active users</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Card className="relative overflow-hidden backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                        <Database className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        <Star className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {platformStats.knowledgeArticles.toLocaleString()}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">Knowledge Articles</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Searchable content pieces</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <Card className="relative overflow-hidden backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +156%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {platformStats.apiCalls.toLocaleString()}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">API Calls</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">This month</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <Card className="relative overflow-hidden backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Excellent
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {platformStats.uptime}%
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">Uptime</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Last 30 days</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <Card className="relative overflow-hidden backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        <Zap className="h-3 w-3 mr-1" />
                        Fast
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {platformStats.responseTime}ms
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">Avg Response Time</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Global average</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="py-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Powerful Features
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Everything you need to build, manage, and scale your knowledge base
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div className={`p-4 bg-gradient-to-r ${feature.color} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                              {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="py-16 text-center"
          >
            <Card className="relative overflow-hidden backdrop-blur-sm bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 border-0 shadow-2xl">
              <CardContent className="p-12 md:p-16">
                <div className="max-w-3xl mx-auto space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Ready to Transform Your Knowledge Management?
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                    Join thousands of organizations already using InfinityKB to unlock the full potential of their knowledge assets.
                  </p>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
                  >
                    <Button 
                      onClick={handleGetStarted}
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      {user ? 'Access Your Dashboard' : 'Get Started Free'}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    {!user && (
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="px-10 py-4 text-lg font-semibold border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => router.push('/auth/login')}
                      >
                        Sign In
                        <CheckCircle className="h-5 w-5 ml-2" />
                      </Button>
                    )}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
