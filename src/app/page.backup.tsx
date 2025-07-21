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

// Force dynamic rendering to avoid build-time prerendering issues
export const dynamic = 'force-dynamic';

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
      title: "Centralized Data Hub",
      description: "Unified platform for all your organizational knowledge and documentation",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless collaboration tools with role-based access and real-time updates",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast Search",
      description: "Find any information instantly with our advanced semantic search engine",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with encryption, audit logs, and compliance features",
      color: "from-red-500 to-rose-500"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Comprehensive analytics to understand knowledge usage and team productivity",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO, TechCorp",
      content: "InfinityKB transformed how our team manages knowledge. The AI-powered search is incredible.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager, StartupXYZ",
      content: "Finally, a knowledge base that actually understands context. Our productivity increased by 40%.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Emily Watson",
      role: "Head of Operations, BigCorp",
      content: "The collaboration features are outstanding. Our distributed team feels more connected than ever.",
      rating: 5,
      avatar: "EW"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: 29,
      period: "month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 10 team members",
        "5GB storage",
        "Basic AI search",
        "Email support",
        "Standard templates"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: 99,
      period: "month",
      description: "Ideal for growing organizations",
      features: [
        "Up to 100 team members",
        "100GB storage",
        "Advanced AI search",
        "Priority support",
        "Custom templates",
        "Analytics dashboard",
        "API access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: 299,
      period: "month",
      description: "For large organizations with advanced needs",
      features: [
        "Unlimited team members",
        "1TB storage",
        "Enterprise AI features",
        "24/7 dedicated support",
        "Custom integrations",
        "Advanced analytics",
        "SSO & compliance",
        "On-premise deployment"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="relative">
        {/* Hero Section */}
        <main className="relative">
          {/* Hero */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Badge variant="secondary" className="mb-4 bg-blue-500/10 text-blue-300 border-blue-500/20">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered Knowledge Management
                  </Badge>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent"
                >
                  Infinity Knowledge Base
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed"
                >
                  Transform your organization's knowledge into actionable insights with AI-powered search, 
                  intelligent organization, and seamless collaboration.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                >
                  {user ? (
                    <Button 
                      size="lg" 
                      onClick={() => router.push('/dashboard')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => router.push('/auth/login')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        Get Started Free
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
                      >
                        Watch Demo
                      </Button>
                    </>
                  )}
                </motion.div>

                {/* Platform Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="grid grid-cols-2 md:grid-cols-6 gap-8 max-w-4xl mx-auto"
                >
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-blue-300">{platformStats.totalProjects.toLocaleString()}</div>
                    <div className="text-sm text-blue-200">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-green-300">{platformStats.activeUsers.toLocaleString()}</div>
                    <div className="text-sm text-blue-200">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-purple-300">{platformStats.knowledgeArticles.toLocaleString()}</div>
                    <div className="text-sm text-blue-200">Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-yellow-300">{platformStats.apiCalls.toLocaleString()}</div>
                    <div className="text-sm text-blue-200">API Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-emerald-300">{platformStats.uptime}%</div>
                    <div className="text-sm text-blue-200">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-orange-300">{platformStats.responseTime}ms</div>
                    <div className="text-sm text-blue-200">Response</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="py-24 bg-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-600 border-blue-200">
                  <Zap className="h-3 w-3 mr-1" />
                  Powerful Features
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                  Everything you need to manage knowledge
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our comprehensive platform provides all the tools your team needs to capture, 
                  organize, and leverage organizational knowledge effectively.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="py-24 bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
              <CardContent className="p-12 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to transform your knowledge management?
                  </h2>
                  <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    Join thousands of organizations already using InfinityKB to unlock their collective intelligence.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {user ? (
                      <Button 
                        size="lg" 
                        onClick={() => router.push('/dashboard')}
                        className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        Access Dashboard
                        <CheckCircle className="h-5 w-5 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        onClick={() => router.push('/auth/login')}
                        className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        Start Your Free Trial
                        <CheckCircle className="h-5 w-5 ml-2" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
