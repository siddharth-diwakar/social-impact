"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Calendar,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type CategoryScore = {
  category: string;
  score: number;
  issues: number;
  total: number;
};

type ComplianceScoreData = {
  overallScore: number;
  categoryScores: CategoryScore[];
  recommendations: string[];
  stats: {
    totalDocuments: number;
    expiredDocuments: number;
    expiringSoon: number;
    documentsWithExpiration: number;
    documentsWithoutExpiration: number;
  };
};

export function ComplianceHealthScore() {
  const [scoreData, setScoreData] = useState<ComplianceScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const response = await fetch("/api/compliance/score");
        if (!response.ok) {
          throw new Error("Failed to fetch compliance score");
        }
        const data = await response.json();
        setScoreData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load compliance score");
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 dark:bg-emerald-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 40) return "Needs Improvement";
    return "Critical";
  };

  if (loading) {
    return (
      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardContent className="p-8 text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Calculating compliance score...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-emerald-100 bg-white/90 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/70">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-600 dark:text-red-400" />
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!scoreData) {
    return null;
  }

  const { overallScore, categoryScores, recommendations, stats } = scoreData;

  return (
    <Card className="border-emerald-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Compliance Health
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Overall status
            </CardDescription>
          </div>
          <Badge
            className={`text-xs ${getScoreBgColor(overallScore)} ${getScoreColor(overallScore)} border-0`}
          >
            {getScoreLabel(overallScore)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score Display - Compact */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`rounded-full p-2 ${getScoreBgColor(overallScore)}`}
              >
                <Shield
                  className={`h-4 w-4 ${getScoreColor(overallScore)}`}
                />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {overallScore}
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    /100
                  </span>
                </p>
              </div>
            </div>
            {overallScore >= 80 ? (
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            )}
          </div>
          <Progress value={overallScore} className="h-1.5" />
        </div>

        {/* Quick Stats - Compact */}
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Total
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                {stats.totalDocuments}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Expiring
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                {stats.expiringSoon}
              </p>
            </div>
          </div>
          {stats.expiredDocuments > 0 && (
            <div className="col-span-2 flex items-center gap-1.5 rounded bg-red-50 px-2 py-1 dark:bg-red-900/20">
              <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
              <p className="text-[10px] font-medium text-red-700 dark:text-red-300">
                {stats.expiredDocuments} expired
              </p>
            </div>
          )}
        </div>

        {/* Category Breakdown - Compact (Show top 3) */}
        {categoryScores.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-50">
              Categories
            </h3>
            <div className="space-y-1.5">
              {categoryScores.slice(0, 3).map((category) => (
                <div key={category.category} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2">
                      {category.category}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {category.issues > 0 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 text-red-600 dark:text-red-400"
                        >
                          {category.issues}
                        </Badge>
                      )}
                      <span
                        className={`text-[10px] font-semibold ${getScoreColor(category.score)}`}
                      >
                        {category.score}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={category.score}
                    className="h-1"
                  />
                </div>
              ))}
              {categoryScores.length > 3 && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                  +{categoryScores.length - 3} more categories
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recommendations - Compact (Show top 2) */}
        {recommendations.length > 0 && (
          <div className="space-y-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-2.5 dark:border-emerald-900 dark:bg-emerald-900/20">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-50">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              Top Actions
            </h3>
            <ul className="space-y-1.5">
              {recommendations.slice(0, 2).map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-1.5 text-[10px] text-slate-700 dark:text-slate-300"
                >
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-emerald-600 dark:bg-emerald-400 flex-shrink-0"></span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
              {recommendations.length > 2 && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  +{recommendations.length - 2} more recommendations
                </p>
              )}
            </ul>
          </div>
        )}

        {/* Action Button - Compact */}
        <Button asChild variant="outline" size="sm" className="w-full text-xs h-8">
          <Link href="/Documents">
            Manage Documents
            <ArrowRight className="ml-1.5 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

