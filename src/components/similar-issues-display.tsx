'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, GitBranch, MessageSquare, Tag, Search } from 'lucide-react';
import { IngestedSearchResult } from '@/services/ingested-github-search-service';
import { IssueDetailsModal } from './issue-details-modal';

interface SimilarIssuesDisplayProps {
  issues: IngestedSearchResult[];
  searchQuery?: string;
}

export function SimilarIssuesDisplay({ issues, searchQuery }: SimilarIssuesDisplayProps) {
  const [selectedIssue, setSelectedIssue] = useState<IngestedSearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!issues || issues.length === 0) {
    return null;
  }

  const handleIssueClick = (issue: IngestedSearchResult) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
  };

  const getStatusColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'merged':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (issue: IngestedSearchResult) => {
    if (issue.pull_request) {
      return <GitBranch className="h-4 w-4" />;
    }
    return <Tag className="h-4 w-4" />;
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      <Card className="mt-4 border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-900">
            <Search className="h-5 w-5" />
            Similar Issues Found
            <Badge variant="secondary" className="ml-auto">
              {issues.length} result{issues.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Based on your query: "{searchQuery}"
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {issues.slice(0, 5).map((issue, index) => (
            <Card
              key={`${issue.repository}-${issue.number}-${index}`}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 bg-white/70"
              onClick={() => handleIssueClick(issue)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(issue)}
                      <h4 className="font-medium text-sm line-clamp-1">
                        {issue.title}
                      </h4>
                      <Badge className={`${getStatusColor(issue.state)} text-xs`}>
                        {issue.state}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="font-medium">{issue.repository}</span>
                      <span>•</span>
                      <span>#{issue.number}</span>
                      {issue.user?.login && (
                        <>
                          <span>•</span>
                          <span>by {issue.user.login}</span>
                        </>
                      )}
                    </div>

                    {issue.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {truncateText(issue.body)}
                      </p>
                    )}

                    {issue.labels && issue.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {issue.labels.slice(0, 3).map((label, labelIndex) => (
                          <Badge
                            key={labelIndex}
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {typeof label === 'string' ? label : label.name}
                          </Badge>
                        ))}
                        {issue.labels.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{issue.labels.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {issue.relevance_score && (
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(issue.relevance_score * 100)}% match
                      </Badge>
                    )}
                    {issue.html_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(issue.html_url, '_blank');
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {issues.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Showing top 5 results. {issues.length - 5} more issues found.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <IssueDetailsModal
        issue={selectedIssue}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
