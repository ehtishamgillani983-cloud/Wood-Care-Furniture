import React, { useState } from 'react';
import { 
  ChevronRight, 
  Star, 
  MessageSquarePlus, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { Store } from '../services/store';

interface ReviewsPageProps {
  onNavigate: (path: string) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onNavigate }) => {
  const { approvedReviews } = useStoreData();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    author_name: '',
    location: '',
    rating: 5,
    review_text: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author_name || !formData.review_text) return;

    Store.submitReview({
      author_name: formData.author_name,
      location: formData.location || 'Rawalpindi / Islamabad',
      rating: Number(formData.rating),
      review_text: formData.review_text
    });

    setSubmitted(true);
    setTimeout(() => {
      setShowSubmitModal(false);
      setSubmitted(false);
      setFormData({ author_name: '', location: '', rating: 5, review_text: '' });
    }, 3000);
  };

  const averageRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <button onClick={() => onNavigate('/')} className="hover:text-[#2D241E] transition-colors">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-stone-400" />
        <span className="font-semibold text-[#8A5A36]">Customer Reviews</span>
      </nav>

      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E6E1D6]">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A5A36] font-bold block">
            REVIEWS
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#2D241E] tracking-tight">
            Client Feedback & Reviews
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
            Read honest impressions from homeowners, architects, and corporate clients across Rawalpindi and Islamabad.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end text-[#B68D40]">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-serif text-2xl font-bold text-[#2D241E] tabular-nums">{averageRating}</span>
              <span className="text-xs text-stone-400">/ 5.0</span>
            </div>
            <span className="text-[11px] text-stone-500 block">
              Based on {approvedReviews.length} client reviews
            </span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2.5 bg-[#2D241E] hover:bg-[#8A5A36] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl p-6 flex flex-col justify-between shadow-xs"
          >
            <div className="space-y-3">
              {/* Star row */}
              <div className="flex items-center gap-1 text-[#B68D40]">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                "{rev.review_text}"
              </p>
            </div>

            <div className="pt-4 border-t border-[#E6E1D6] mt-4 flex items-center justify-between text-xs text-stone-500">
              <div>
                <span className="font-semibold text-[#2D241E] block">{rev.author_name}</span>
                <span className="text-[11px]">{rev.location}</span>
              </div>
              <span className="text-[11px] text-stone-400">{rev.created_at}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Review Modal */}
      {showSubmitModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowSubmitModal(false)}
        >
          <div 
            className="bg-[#FAF9F5] max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#E6E1D6] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8A5A36]">
                Share Your Experience
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#2D241E]">
                Submit Your Review
              </h3>
              <p className="text-xs text-stone-500">
                Your feedback helps us continuously refine our woodworking standards.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-[#F4F1EA] border border-[#B68D40] rounded-xl text-center space-y-2">
                <Check className="w-8 h-8 text-[#128C7E] mx-auto" />
                <h4 className="font-serif text-lg font-semibold text-[#2D241E]">
                  Review Submitted!
                </h4>
                <p className="text-xs text-stone-600">
                  Thank you for your feedback. In line with our anti-spam policy, reviews are published following admin moderation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#2D241E] font-medium mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Qureshi"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E6E1D6] rounded-lg focus:outline-none focus:border-[#8A5A36]"
                  />
                </div>

                <div>
                  <label className="block text-[#2D241E] font-medium mb-1">Location / Sector *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bahria Town Phase 8, Rawalpindi"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E6E1D6] rounded-lg focus:outline-none focus:border-[#8A5A36]"
                  />
                </div>

                <div>
                  <label className="block text-[#2D241E] font-medium mb-1">Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-[#E6E1D6] rounded-lg focus:outline-none focus:border-[#8A5A36]"
                  >
                    <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                    <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                    <option value={2}>★★☆☆☆ (2 Stars - Needs Improvement)</option>
                    <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#2D241E] font-medium mb-1">Your Review *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the furniture piece, wood quality, delivery experience..."
                    value={formData.review_text}
                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E6E1D6] rounded-lg focus:outline-none focus:border-[#8A5A36]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 text-stone-500 hover:text-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#2D241E] hover:bg-[#8A5A36] text-white font-semibold rounded-lg transition-colors"
                  >
                    Submit for Approval
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
