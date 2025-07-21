"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { useRouter } from 'next/navigation';

// Force dynamic rendering to avoid build-time prerendering issues
export const dynamic = 'force-dynamic';

export default function Home() {
  const { user } = useDexieAuthStore();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="relative">
        <main className="relative">
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                  Infinity Knowledge Base
                </h1>
                
                <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Transform your organization's knowledge into actionable insights with AI-powered search, 
                  intelligent organization, and seamless collaboration.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
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
                </div>
              </div>
            </div>
          </section>

          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                  Everything you need to manage knowledge
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our comprehensive platform provides all the tools your team needs to capture, 
                  organize, and leverage organizational knowledge effectively.
                </p>
              </div>
            </div>
          </section>

          <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-xl p-12 text-center">
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
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={() => router.push('/auth/login')}
                      className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      Start Your Free Trial
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
