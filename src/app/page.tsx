
"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex-1 overflow-auto p-8">
      <motion.div 
        className="max-w-4xl mx-auto text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-4xl font-bold tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Welcome to InfinityKB
        </motion.h1>
        <motion.p 
          className="text-xl text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Your intelligent knowledge base assistant
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <motion.div 
            className="border rounded-lg p-6 text-left hover:border-primary transition-colors"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <h2 className="text-2xl font-semibold mb-2">Knowledge Base</h2>
            <p className="text-muted-foreground">Access and manage your organization's knowledge base</p>
          </motion.div>
          <motion.div 
            className="border rounded-lg p-6 text-left hover:border-primary transition-colors"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <h2 className="text-2xl font-semibold mb-2">AI Assistant</h2>
            <p className="text-muted-foreground">Get intelligent answers to your questions</p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
