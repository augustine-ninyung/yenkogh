import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  MapPin,
  Compass,
  CheckCircle2,
  Bookmark,
  RefreshCw,
} from 'lucide-react';
import { aiPlannerService } from '@/services/aiPlannerService';
import { tripService } from '@/services/tripService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { destinations } from '@/data/destinations';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { PlannerInput, Itinerary } from '@/types';

const INTERESTS_OPTIONS = [
  'Historical Castles & Slavery Heritage',
  'Canopy Walks & Rainforest Hiking',
  'Wildlife Safaris & Elephants',
  'Traditional Festivals & Royal Durbars',
  'Beaches & Coastal Relaxation',
  'Local Food (Waakye, Jollof, Fufu)',
  'Art, Kente Cloth & Craft Markets',
  'Waterfalls & Lake Cruising',
];

export const AIPlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const prefillDest = searchParams.get('destination');

  // Form State
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    prefillDest ? [prefillDest] : ['Cape Coast Castle', 'Kakum National Park']
  );
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-18');
  const [numberOfTravelers, setNumberOfTravelers] = useState(2);
  const [budget, setBudget] = useState(2500);
  const [interests, setInterests] = useState<string[]>([
    'Historical Castles & Slavery Heritage',
    'Local Food (Waakye, Jollof, Fufu)',
  ]);
  const [accommodationType, setAccommodationType] = useState<'budget' | 'mid-range' | 'luxury'>('mid-range');
  const [specialRequests] = useState('');

  // Planner Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);
  const [step, setStep] = useState<'form' | 'itinerary'>('form');

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addDestination = (name: string) => {
    if (name && !selectedDestinations.includes(name)) {
      setSelectedDestinations([...selectedDestinations, name]);
    }
  };

  const removeDestination = (name: string) => {
    setSelectedDestinations(selectedDestinations.filter((d) => d !== name));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDestinations.length === 0) {
      addToast({
        variant: 'warning',
        title: 'Destination Required',
        message: 'Please choose at least one destination in Ghana.',
      });
      return;
    }

    setIsGenerating(true);
    setStep('itinerary');

    try {
      const input: PlannerInput = {
        destinations: selectedDestinations,
        startDate,
        endDate,
        numberOfTravelers,
        budget,
        interests,
        transportPreference: ['bus', 'taxi'],
        accommodationType,
        specialRequests,
      };

      const result = await aiPlannerService.generateItinerary(input);
      setGeneratedItinerary(result);
      addToast({
        variant: 'success',
        title: 'Itinerary Ready!',
        message: 'Your custom Ghana journey has been synthesized successfully.',
      });
    } catch (err) {
      console.error(err);
      addToast({
        variant: 'error',
        title: 'Planning Error',
        message: 'Could not generate itinerary. Please try again.',
      });
      setStep('form');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!isAuthenticated || !user) {
      addToast({
        variant: 'info',
        title: 'Account Required',
        message: 'Please log in to save this trip to your dashboard.',
      });
      navigate('/login');
      return;
    }

    if (!generatedItinerary) return;

    try {
      await tripService.create(user.id, {
        userId: user.id,
        name: generatedItinerary.title,
        destinations: selectedDestinations,
        startDate,
        endDate,
        numberOfTravelers,
        status: 'planning',
        itinerary: generatedItinerary,
      });

      addToast({
        variant: 'success',
        title: 'Trip Saved!',
        message: 'Your itinerary is now stored in My Trips.',
      });
      navigate('/dashboard/trips');
    } catch {
      addToast({
        variant: 'error',
        title: 'Save Failed',
        message: 'Could not save trip. Please try again.',
      });
    }
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 dark:bg-[#090C11] min-h-screen text-[#262B32] dark:text-white">
      {/* Header Banner */}
      <div className="bg-[#262B32] dark:bg-[#090C11] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <Badge variant="primary" className="mb-3">
            AI-Powered Travel Intelligence
          </Badge>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-5xl font-bold mb-3">
            Smart Ghana Trip Planner
          </h1>
          <p className="text-white/70 max-w-2xl text-sm sm:text-base">
            Tell us where you want to go and what you love. Our smart planner creates a balanced, cost-effective day-by-day travel plan across Ghana with local transport, cultural dining, and timing tips.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'form' ? (
          /* Planning Input Wizard Form */
          <form onSubmit={handleGenerate} className="space-y-8">
            {/* Step 1: Destinations */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MapPin size={18} className="text-[#FFD300]" />
                <span>1. Where would you like to visit?</span>
              </h2>

              {/* Selected Pills */}
              <div className="flex flex-wrap gap-2">
                {selectedDestinations.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFD300]/20 text-[#090C11] dark:text-[#FFD300]"
                  >
                    <span>{d}</span>
                    <button
                      type="button"
                      onClick={() => removeDestination(d)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick suggestions */}
              <div>
                <span className="text-xs text-[#757B81] block mb-2">Quick additions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {destinations.slice(0, 8).map((dest) => (
                    <button
                      type="button"
                      key={dest.id}
                      onClick={() => addDestination(dest.name)}
                      className="px-2.5 py-1 rounded-lg text-xs border border-gray-200 dark:border-white/10 hover:border-[#FFD300] hover:bg-[#FFD300]/10 transition-colors"
                    >
                      + {dest.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Dates, Travelers & Budget */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar size={18} className="text-[#FFD300]" />
                <span>2. Dates, Travelers & Budget</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#757B81] block mb-1.5 uppercase">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#757B81] block mb-1.5 uppercase">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#757B81] block mb-1.5 uppercase">
                    Travelers
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={numberOfTravelers}
                    onChange={(e) => setNumberOfTravelers(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#757B81] block mb-1.5 uppercase">
                    Target Budget (GH₵)
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value) || 500)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Interests & Travel Style */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Compass size={18} className="text-[#FFD300]" />
                <span>3. Travel Style & Interests</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-[#757B81] block mb-2 uppercase">
                    What excites you in Ghana?
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {INTERESTS_OPTIONS.map((interest) => (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-xl text-xs sm:text-sm font-medium border text-left flex items-center justify-between transition-all ${
                          interests.includes(interest)
                            ? 'bg-[#FFD300]/20 border-[#FFD300] text-[#090C11] dark:text-[#FFD300]'
                            : 'border-gray-200 dark:border-white/10 text-[#757B81] dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <span>{interest}</span>
                        {interests.includes(interest) && (
                          <CheckCircle2 size={16} className="text-[#FFD300] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[#757B81] block mb-2 uppercase">
                    Accommodation Tier
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {(['budget', 'mid-range', 'luxury'] as const).map((tier) => (
                      <button
                        type="button"
                        key={tier}
                        onClick={() => setAccommodationType(tier)}
                        className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize border text-center transition-all ${
                          accommodationType === tier
                            ? 'bg-[#FFD300] border-[#FFD300] text-[#090C11]'
                            : 'border-gray-200 dark:border-white/10 text-[#757B81] dark:text-white/80'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-2">
              <Button type="submit" variant="primary" size="xl" className="px-12 font-bold shadow-xl">
                <Sparkles size={20} />
                <span>Generate Smart Ghana Itinerary</span>
              </Button>
            </div>
          </form>
        ) : (
          /* Itinerary Result Display */
          <div className="space-y-8 animate-in fade-in duration-300">
            {isGenerating ? (
              <div className="p-16 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 text-center space-y-4 shadow-xl">
                <Spinner size="lg" color="primary" />
                <h3 className="text-xl font-bold">Synthesizing Your Ghana Journey...</h3>
                <p className="text-sm text-[#757B81] max-w-md mx-auto">
                  Calculating road distances, optimizing daily activities, estimating entrance fees in Cedis, and assembling local restaurant suggestions.
                </p>
              </div>
            ) : generatedItinerary ? (
              <div className="space-y-8">
                {/* Header Action Card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-[#757B81] block mb-1">Generated Itinerary</span>
                    <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold">
                      {generatedItinerary.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#757B81] mt-1">
                      {generatedItinerary.days.length} Days · Estimated Cost:{' '}
                      <span className="font-bold text-[#090C11] dark:text-[#FFD300]">
                        {formatCurrency(generatedItinerary.totalEstimatedCost)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep('form')}
                      className="gap-1.5"
                    >
                      <RefreshCw size={14} />
                      <span>Adjust</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveTrip}
                      className="gap-1.5 font-bold"
                    >
                      <Bookmark size={14} />
                      <span>Save to My Trips</span>
                    </Button>
                  </div>
                </div>

                {/* Day-by-Day Timeline */}
                <div className="space-y-6">
                  {generatedItinerary.days.map((day) => (
                    <div
                      key={day.day}
                      className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-[#FFD300] text-[#090C11] font-bold flex items-center justify-center text-sm">
                            D{day.day}
                          </span>
                          <div>
                            <h3 className="font-bold text-base sm:text-lg">{day.location}</h3>
                            <span className="text-xs text-[#757B81]">{day.description}</span>
                          </div>
                        </div>

                        {day.date && (
                          <span className="text-xs font-semibold text-[#757B81]">
                            {formatDate(day.date)}
                          </span>
                        )}
                      </div>

                      {/* Items inside day */}
                      <div className="space-y-3 pt-2">
                        {day.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-start justify-between gap-3 text-xs sm:text-sm"
                          >
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-xs font-bold text-[#FFD300] shrink-0 mt-0.5">
                                {item.time || '10:00'}
                              </span>
                              <div>
                                <h4 className="font-bold text-[#090C11] dark:text-white">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-[#757B81] dark:text-white/70 mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            {item.cost !== undefined && item.cost > 0 && (
                              <span className="font-bold text-xs shrink-0 text-[#090C11] dark:text-[#FFD300]">
                                {formatCurrency(item.cost)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPlannerPage;
