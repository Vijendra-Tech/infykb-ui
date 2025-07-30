"use client";

import React from 'react';
import { GitHubSimilaritySearch } from '@/components/github-similarity-search';
import { Search } from 'lucide-react';

export default function IssuesPage() {
  const handleIssueSelect = (issue: any) => {
    // Open the GitHub issue in a new tab
    if (issue.html_url) {
      window.open(issue.html_url, '_blank');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-8xl">
      {/* Simple Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
            <Search className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Issue Search
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find GitHub issues quickly using smart search
        </p>
      </div>

      {/* Main Search Interface */}
      <div className="overflow-hidden">
        <GitHubSimilaritySearch 
          onIssueSelect={handleIssueSelect}
          className=""
        />
      </div>
    </div>
  );
}
