import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Bookmark,
  Plus,
  Trash2,
  Palette,
  Utensils,
  Camera,
  Music,
  Gift,
  PartyPopper,
  CheckCircle2,
  Loader2,
  DollarSign,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { FullEventData, IdeaStudioItem, IdeaCategory } from '../types/index.ts';
import { api } from '../services/api.ts';

interface IdeaStudioProps {
  eventData: FullEventData;
  onRefresh: () => void;
}

export const IdeaStudio: React.FC<IdeaStudioProps> = ({ eventData, onRefresh }) => {
  const { event, ideas } = eventData;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedBudgetLevel, setSelectedBudgetLevel] = useState<string>('balanced');
  const [generatorCategory, setGeneratorCategory] = useState<IdeaCategory>('theme');

  const categories: { id: IdeaCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'theme', label: 'Themes & Aesthetics', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'color_palette', label: 'Color Palettes', icon: <Palette className="w-4 h-4" /> },
    { id: 'decor', label: 'Decorations & Florals', icon: <Layers className="w-4 h-4" /> },
    { id: 'menu', label: 'Menu & Food Concepts', icon: <Utensils className="w-4 h-4" /> },
    { id: 'photoshoot', label: 'Photo Shot Lists', icon: <Camera className="w-4 h-4" /> },
    { id: 'music', label: 'Music & Performances', icon: <Music className="w-4 h-4" /> },
    { id: 'games', label: 'Games & Activities', icon: <PartyPopper className="w-4 h-4" /> },
    { id: 'gifts', label: 'Favors & Gifts', icon: <Gift className="w-4 h-4" /> },
  ];

  const handleToggleFavorite = async (idea: IdeaStudioItem) => {
    try {
      await api.updateIdea(event.id, idea.id, { isFavorite: !idea.isFavorite });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAttach = async (idea: IdeaStudioItem) => {
    try {
      await api.updateIdea(event.id, idea.id, { isAttached: !idea.isAttached });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIdea = async (iId: string) => {
    if (!window.confirm('Remove this idea card?')) return;
    try {
      await api.deleteIdea(event.id, iId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateCreativeIdeas({
        category: generatorCategory,
        eventType: event.type,
        theme: event.theme,
        budgetLevel: selectedBudgetLevel,
      });

      if (res.ideas && Array.isArray(res.ideas)) {
        for (const item of res.ideas) {
          await api.addIdea(event.id, {
            category: item.category || generatorCategory,
            title: item.title,
            description: item.description,
            estimatedCost: item.estimatedCost,
            materials: item.materials,
            steps: item.steps,
            budgetAlternative: item.budgetAlternative,
          });
        }
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredIdeas = ideas.filter(i => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'favorites') return i.isFavorite;
    return i.category === activeCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5A859]">
            <span>Creative Atelier</span>
            <span>·</span>
            <span>Theme: {event.theme}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1B3B2B]">
            AI Theme & Idea Studio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7D73]">
            {ideas.length} Saved Ideas · {ideas.filter(i => i.isFavorite).length} Favorited
          </span>
        </div>
      </div>

      {/* Generator Prompt Box */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B3B2B]">
          <Sparkles className="w-4 h-4 text-[#C5A859]" />
          <span>Generate Bespoke Creative Concepts for "{event.name}"</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
              Select Creative Domain
            </label>
            <select
              value={generatorCategory}
              onChange={e => setGeneratorCategory(e.target.value as IdeaCategory)}
              className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1B3B2B] font-medium"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
              Budget Feasibility Profile
            </label>
            <select
              value={selectedBudgetLevel}
              onChange={e => setSelectedBudgetLevel(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1B3B2B]"
            >
              <option value="luxury">High-End Bespoke Luxury</option>
              <option value="balanced">Balanced & Elevated Value</option>
              <option value="budget_smart">Cost-Conscious / Smart DIY</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              onClick={handleGenerateIdeas}
              disabled={isGenerating}
              className="w-full py-2 px-4 text-xs font-bold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A859]" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#C5A859]" />
                  <span>Generate Concepts</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
            activeCategory === 'all'
              ? 'bg-[#1B3B2B] text-white'
              : 'bg-white text-[#4A5750] border border-[#DDD5C7] hover:bg-[#F2EDE4]'
          }`}
        >
          All Concepts ({ideas.length})
        </button>
        <button
          onClick={() => setActiveCategory('favorites')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium flex items-center gap-1 ${
            activeCategory === 'favorites'
              ? 'bg-[#1B3B2B] text-white'
              : 'bg-white text-[#4A5750] border border-[#DDD5C7] hover:bg-[#F2EDE4]'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>Favorites ({ideas.filter(i => i.isFavorite).length})</span>
        </button>
        {categories.map(c => {
          const count = ideas.filter(i => i.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium flex items-center gap-1 ${
                activeCategory === c.id
                  ? 'bg-[#1B3B2B] text-white'
                  : 'bg-white text-[#4A5750] border border-[#DDD5C7] hover:bg-[#F2EDE4]'
              }`}
            >
              <span>{c.label}</span>
              <span className="text-[10px] text-[#8C9B92]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Ideas Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-[#8C9B92] bg-white rounded-2xl border border-[#E8E2D8]">
            No concept cards saved in this category yet. Use the prompt box above to generate ideas!
          </div>
        ) : (
          filteredIdeas.map(idea => (
            <div
              key={idea.id}
              className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#C5A859] tracking-wider">
                    {idea.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(idea)}
                      className="p-1 text-[#8C9B92] hover:text-red-500 transition-colors"
                      title="Save to favorites"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          idea.isFavorite ? 'text-red-500 fill-red-500' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteIdea(idea.id)}
                      className="p-1 text-[#8C9B92] hover:text-red-600 transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold font-serif text-[#1B3B2B] mb-1.5">
                    {idea.title}
                  </h3>
                  <p className="text-xs text-[#52635A] leading-relaxed">
                    {idea.description}
                  </p>
                </div>

                {idea.estimatedCost && (
                  <div className="flex items-center gap-1.5 text-xs text-[#1B3B2B] font-semibold bg-[#FAF8F5] p-2 rounded-lg border border-[#E8E2D8]">
                    <DollarSign className="w-3.5 h-3.5 text-[#C5A859]" />
                    <span>Est. Cost: {idea.estimatedCost}</span>
                  </div>
                )}

                {idea.materials?.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-[#1B3B2B]">Required Materials & Decor:</p>
                    <div className="flex flex-wrap gap-1">
                      {idea.materials.map((m, mIdx) => (
                        <span key={mIdx} className="text-[10px] text-[#4A5750] bg-[#F2EDE4] px-2 py-0.5 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {idea.budgetAlternative && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                    <p className="font-semibold text-[11px] text-amber-900">
                      ★ Smart Lower-Cost Alternative:
                    </p>
                    <p className="text-[11px] leading-relaxed text-amber-900">
                      {idea.budgetAlternative}
                    </p>
                  </div>
                )}
              </div>

              <div className="px-6 py-3 bg-[#FAF8F5] border-t border-[#E8E2D8] flex items-center justify-between text-xs">
                <button
                  onClick={() => handleToggleAttach(idea)}
                  className={`font-semibold flex items-center gap-1.5 ${
                    idea.isAttached ? 'text-emerald-700' : 'text-[#6B7D73] hover:text-[#1B3B2B]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{idea.isAttached ? 'Attached to Master Event' : 'Attach to Event'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
