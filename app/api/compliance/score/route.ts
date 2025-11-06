import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CategoryScore = {
  category: string;
  score: number;
  issues: number;
  total: number;
};

type ComplianceScore = {
  overallScore: number;
  categoryScores: CategoryScore[];
  recommendations: string[];
  stats: {
    totalDocuments: number;
    expiredDocuments: number;
    expiringSoon: number; // within 30 days
    documentsWithExpiration: number;
    documentsWithoutExpiration: number;
  };
};

// Categories to track
const CATEGORIES = [
  "Tax",
  "Legal",
  "Compliance",
  "HR",
  "Finance",
  "Planning",
  "Governance",
  "Risk",
  "Operations",
];

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user documents
    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Calculate stats
    const totalDocuments = documents?.length || 0;
    let expiredDocuments = 0;
    let expiringSoon = 0;
    let documentsWithExpiration = 0;
    let documentsWithoutExpiration = 0;

    // First, count all documents with expiration issues (across all categories)
    documents?.forEach((doc) => {
      if (doc.expiration_date) {
        documentsWithExpiration++;
        const expDate = new Date(doc.expiration_date);
        
        if (expDate < now) {
          // Expired
          expiredDocuments++;
        } else if (expDate >= now && expDate <= thirtyDaysFromNow) {
          // Expiring soon (within 30 days, but not expired)
          expiringSoon++;
        }
      } else {
        documentsWithoutExpiration++;
      }
    });

    // Calculate category scores
    const categoryScores: CategoryScore[] = CATEGORIES.map((category) => {
      const categoryDocs = documents?.filter(
        (doc) => doc.category === category
      ) || [];

      let categoryIssues = 0;
      let categoryTotal = categoryDocs.length;

      categoryDocs.forEach((doc) => {
        if (doc.expiration_date) {
          const expDate = new Date(doc.expiration_date);
          
          if (expDate < now) {
            // Expired - critical issue (full penalty)
            categoryIssues += 1.0;
          } else if (expDate >= now && expDate <= thirtyDaysFromNow) {
            // Expiring soon (within 30 days, but not expired) - warning (partial penalty)
            // Calculate days until expiration for more nuanced scoring
            const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            // More urgent = higher penalty: 30 days = 0.2, 1 day = 0.5
            const urgencyPenalty = 0.2 + (0.3 * (1 - (daysUntilExpiration / 30)));
            categoryIssues += urgencyPenalty;
          }
        } else {
          // Documents without expiration dates are considered incomplete
          // Only count as issue if category typically requires expiration
          const requiresExpiration = ["Compliance", "Legal", "Tax", "Risk"].includes(category);
          if (requiresExpiration && categoryDocs.length > 0) {
            categoryIssues += 0.3; // Small penalty for missing expiration
          }
        }
      });

      // Calculate category score (0-100)
      // Score = 100 - (issues / total * 100), but ensure minimum of 0
      const categoryScore = categoryTotal > 0
        ? Math.max(0, Math.round(100 - (categoryIssues / Math.max(categoryTotal, 1)) * 100))
        : 100; // No documents = perfect score (nothing to manage)

      return {
        category,
        score: categoryScore,
        issues: Math.round(categoryIssues * 10) / 10, // Round to 1 decimal place
        total: categoryTotal,
      };
    });

    // Handle uncategorized documents (documents without a category)
    const uncategorizedDocs = documents?.filter((doc) => !doc.category || doc.category === "") || [];
    let uncategorizedIssues = 0;
    
    uncategorizedDocs.forEach((doc) => {
      if (doc.expiration_date) {
        const expDate = new Date(doc.expiration_date);
        
        if (expDate < now) {
          // Expired - critical issue (full penalty)
          uncategorizedIssues += 1.0;
        } else if (expDate >= now && expDate <= thirtyDaysFromNow) {
          // Expiring soon (within 30 days, but not expired) - warning (partial penalty)
          const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          // More urgent = higher penalty: 30 days = 0.2, 1 day = 0.5
          const urgencyPenalty = 0.2 + (0.3 * (1 - (daysUntilExpiration / 30)));
          uncategorizedIssues += urgencyPenalty;
        }
      }
    });

    const uncategorizedScore = uncategorizedDocs.length > 0
      ? Math.max(0, Math.round(100 - (uncategorizedIssues / uncategorizedDocs.length) * 100))
      : 100;

    // Add uncategorized category to scores if it has documents
    if (uncategorizedDocs.length > 0) {
      categoryScores.push({
        category: "Uncategorized",
        score: uncategorizedScore,
        issues: Math.round(uncategorizedIssues * 10) / 10, // Round to 1 decimal place
        total: uncategorizedDocs.length,
      });
    }

    // Calculate overall score
    // Base score from category average (weighted by number of documents in each category)
    const totalDocsInCategories = categoryScores.reduce((sum, cat) => sum + cat.total, 0);
    
    let weightedScore = 0;
    if (totalDocsInCategories > 0) {
      weightedScore = categoryScores.reduce((sum, cat) => {
        const weight = cat.total / totalDocsInCategories;
        return sum + (cat.score * weight);
      }, 0);
    } else {
      // No documents = perfect score (nothing to manage)
      weightedScore = 100;
    }
    
    // Apply additional penalties for expired and expiring documents
    // These are already partially accounted for in category scores, but we add extra weight
    // Expired documents are critical, so heavier penalty
    const expiredPenalty = expiredDocuments * 10; // Each expired doc = -10 points
    // Expiring soon documents get a lighter penalty since they're warnings, not critical
    const expiringPenalty = expiringSoon * 2; // Each expiring doc = -2 points (reduced from -5)
    
    // Calculate final score
    let overallScore = weightedScore - expiredPenalty - expiringPenalty;
    
    // Ensure score is between 0 and 100
    overallScore = Math.max(0, Math.min(100, Math.round(overallScore)));

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (expiredDocuments > 0) {
      recommendations.push(
        `Renew ${expiredDocuments} expired ${expiredDocuments === 1 ? "document" : "documents"} immediately to avoid compliance issues.`
      );
    }
    
    if (expiringSoon > 0) {
      recommendations.push(
        `Take action on ${expiringSoon} ${expiringSoon === 1 ? "document" : "documents"} expiring within 30 days.`
      );
    }
    
    if (documentsWithoutExpiration > 0 && totalDocuments > 0) {
      const percentage = Math.round((documentsWithoutExpiration / totalDocuments) * 100);
      if (percentage > 50) {
        recommendations.push(
          `Add expiration dates to ${documentsWithoutExpiration} ${documentsWithoutExpiration === 1 ? "document" : "documents"} to improve compliance tracking.`
        );
      }
    }
    
    // Find lowest scoring category
    const lowestCategory = categoryScores
      .filter((cat) => cat.total > 0)
      .sort((a, b) => a.score - b.score)[0];
    
    if (lowestCategory && lowestCategory.score < 70) {
      recommendations.push(
        `Focus on improving your ${lowestCategory.category} compliance (current score: ${lowestCategory.score}%).`
      );
    }
    
    if (totalDocuments === 0) {
      recommendations.push(
        "Upload your first compliance document to get started with tracking."
      );
    } else if (recommendations.length === 0) {
      recommendations.push(
        "Great job! Your compliance is in good shape. Keep up the good work!"
      );
    }

    const result: ComplianceScore = {
      overallScore,
      categoryScores: categoryScores.filter((cat) => cat.total > 0), // Only show categories with documents
      recommendations: recommendations.slice(0, 5), // Limit to top 5
      stats: {
        totalDocuments,
        expiredDocuments,
        expiringSoon,
        documentsWithExpiration,
        documentsWithoutExpiration,
      },
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error calculating compliance score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

