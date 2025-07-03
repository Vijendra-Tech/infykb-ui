
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Clock, Users, Download, Shield, BarChart2, MessageSquare, ThumbsUp, Minus, ThumbsDown } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="grid gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Feedback Dashboard</h1>
                <p className="text-muted-foreground">Monitor sentiment trends and organize client feedback</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-md">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Total Feedback</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold">0</div>
                    <div className="text-sm text-green-600 flex items-center">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      <span>+12% from last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-md">
                          <ThumbsUp className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Satisfaction Rate</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold">0%</div>
                    <div className="text-sm text-green-600 flex items-center">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      <span>+3.2% from last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-100 rounded-md">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium">Avg Response Time</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold">2.3h</div>
                    <div className="text-sm text-red-600 flex items-center">
                      <ArrowDown className="h-4 w-4 mr-1" />
                      <span>-8% from last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-md">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">Active Clients</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold">3</div>
                    <div className="text-sm text-green-600 flex items-center">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      <span>+5 new this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Quick Overview</h2>
                  
                  <Card className="bg-green-500 text-white">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                      <ThumbsUp className="h-8 w-8 mb-2" />
                      <h3 className="text-lg font-medium">Positive</h3>
                      <p className="text-4xl font-bold">0</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-amber-400 text-white">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                      <Minus className="h-8 w-8 mb-2" />
                      <h3 className="text-lg font-medium">Neutral</h3>
                      <p className="text-4xl font-bold">0</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-red-500 text-white">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                      <ThumbsDown className="h-8 w-8 mb-2" />
                      <h3 className="text-lg font-medium">Negative</h3>
                      <p className="text-4xl font-bold">0</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="md:col-span-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <h2 className="text-lg font-semibold">Recent Feedback</h2>
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No feedback data available yet</p>
                        <p className="text-sm">Feedback will appear here once clients start providing responses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
  );
}


