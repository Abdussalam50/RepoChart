import { Sparkles, Edit2, Check, PenTool } from 'lucide-react';
import { useState } from 'react';
import EditableText from '../ui/EditableText';
import insightService from '../../services/insightService';

export function InsightBox({ insight, isLoading, userPlan, reportId, readOnly = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const insights = insight?.insights || [];
  const recommendations = insight?.recommendations || [];
  const displayInsight = insight?.custom_insight_text || insight?.display_insight || insight?.insight_text || '';
  const displayRecommendation = insight?.custom_recommendation_text || insight?.display_recommendation || insight?.recommendation_text || '';

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-violet-50/50 p-6 border border-violet-100">
        <div className="flex items-center gap-3 text-violet-700 font-medium mb-3">
          <Sparkles className="h-5 w-5 animate-spin" />
          <span>Generating AI Insights...</span>
        </div>
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-violet-100 rounded w-full"></div>
          <div className="h-4 bg-violet-100 rounded w-5/6"></div>
          <div className="h-4 bg-violet-100 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  const handleSaveInsight = async (text) => {
    await insightService.updateInsight(reportId, {
      type: 'insight',
      text,
    });
  };

  const handleResetInsight = async () => {
    const res = await insightService.resetInsight(reportId, {
      type: 'insight',
    });
    return res.display_text;
  };

  const handleSaveRecommendation = async (text) => {
    await insightService.updateInsight(reportId, {
      type: 'recommendation',
      text,
    });
  };

  const handleResetRecommendation = async () => {
    const res = await insightService.resetInsight(reportId, {
      type: 'recommendation',
    });
    return res.display_text;
  };

  const isPro = userPlan === 'pro';

  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-3 text-slate-800 font-bold text-base">
          <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
            {isPro ? <Sparkles className="h-4 w-4" /> : <PenTool className="h-4 w-4" />}
          </div>
          <span>{isPro ? 'Report Insights & Recommendations' : 'Report Analysis'}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Insights List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Insights</h4>
          <EditableText
            text={displayInsight}
            onSave={handleSaveInsight}
            onReset={handleResetInsight}
            readOnly={readOnly}
            className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"
          />
        </div>

        {/* Recommendations List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommendations</h4>
          <EditableText
            text={displayRecommendation}
            onSave={handleSaveRecommendation}
            onReset={handleResetRecommendation}
            readOnly={readOnly}
            className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"
          />
        </div>
      </div>
    </div>
  );
}
