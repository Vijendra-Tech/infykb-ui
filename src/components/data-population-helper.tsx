"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Download, 
  Trash2, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { SampleDataService } from '@/services/sample-github-data';
import { ingestedGitHubSearchService } from '@/services/ingested-github-search-service';

interface DataStats {
  totalIssues: number;
  totalPullRequests: number;
  totalDiscussions: number;
}

export function DataPopulationHelper() {
  const [isLoading, setIsLoading] = useState(false);
  const [dataStats, setDataStats] = useState<DataStats>({
    totalIssues: 0,
    totalPullRequests: 0,
    totalDiscussions: 0
  });
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadDataStats();
  }, []);

  const loadDataStats = async () => {
    try {
      const stats = await SampleDataService.getDataStats();
      setDataStats(stats);
    } catch (error) {
      console.error('Error loading data stats:', error);
    }
  };

  const handlePopulateData = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      await SampleDataService.populateGitHubData();
      await loadDataStats();
      setMessage({
        type: 'success',
        text: 'Successfully populated sample GitHub data! The graph should now work.'
      });
    } catch (error) {
      console.error('Error populating data:', error);
      setMessage({
        type: 'error',
        text: 'Failed to populate sample data. Check console for details.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      await SampleDataService.clearGitHubData();
      await loadDataStats();
      setMessage({
        type: 'info',
        text: 'Successfully cleared all GitHub data.'
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      setMessage({
        type: 'error',
        text: 'Failed to clear data. Check console for details.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasData = dataStats.totalIssues > 0 || dataStats.totalPullRequests > 0 || dataStats.totalDiscussions > 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          GitHub Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Statistics */}
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              Issues: {dataStats.totalIssues}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              PRs: {dataStats.totalPullRequests}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              Discussions: {dataStats.totalDiscussions}
            </Badge>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {message.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
            {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {message.type === 'info' && <AlertCircle className="h-4 w-4" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePopulateData}
            disabled={isLoading}
            className="flex items-center gap-2"
            variant={hasData ? "outline" : "default"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {hasData ? 'Repopulate' : 'Populate'} Sample Data
          </Button>

          {hasData && (
            <Button
              onClick={handleClearData}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Clear Data
            </Button>
          )}
        </div>

        {/* Help Text */}
        {!hasData && (
          <div className="text-sm text-muted-foreground p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <strong>Graph UI not loading?</strong> The graph visualization requires GitHub data to display. 
            Click "Populate Sample Data" to add test data and make the graph work.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
