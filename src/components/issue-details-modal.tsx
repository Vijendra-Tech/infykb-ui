'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Calendar, User, MessageSquare, GitBranch, Tag } from 'lucide-react';
import { IngestedSearchResult } from '@/services/ingested-github-search-service';

interface IssueDetailsModalProps {
  issue: IngestedSearchResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IssueDetailsModal({ issue, isOpen, onClose }: IssueDetailsModalProps) {
  if (!issue) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-left mb-2">
                {issue.title}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  {getTypeIcon(issue)}
                  <span className="capitalize">{issue.pull_request ? 'Pull Request' : 'Issue'}</span>
                </div>
                <span>•</span>
                <span>{issue.repository}</span>
                <span>•</span>
                <span>#{issue.number}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(issue.state)}>
                {issue.state}
              </Badge>
              {issue.html_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(issue.html_url, '_blank')}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on GitHub
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-6">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Author:</span>
              <span>{issue.user?.login || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Created:</span>
              <span>{issue.created_at ? formatDate(issue.created_at) : 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Comments:</span>
              <span>{issue.comments || 0}</span>
            </div>
          </div>

          {/* Labels Section */}
          {issue.labels && issue.labels.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Labels</h4>
              <div className="flex flex-wrap gap-2">
                {issue.labels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {typeof label === 'string' ? label : label.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Body Section */}
          {issue.body && (
            <div>
              <h4 className="font-medium mb-3">Description</h4>
              <div className="prose prose-sm max-w-none bg-muted/20 p-4 rounded-lg border">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {issue.body}
                </div>
              </div>
            </div>
          )}

          {/* Relevance Score (for debugging) */}
          {issue.relevance_score && (
            <div className="text-xs text-muted-foreground">
              Relevance Score: {issue.relevance_score.toFixed(2)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
