import { useState, useEffect, useCallback } from 'react'
import { Star, Trash2, MessageSquare, UserCircle, PenTool, LogIn } from 'lucide-react'
import { toast } from 'react-toastify'
import { reviewAPI, getErrorMessage } from '../api'
import { useAuth } from '../context/AuthContext'

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          aria-label={`${star} star`}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hovered || value)
                ? 'fill-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'text-[var(--text-muted)]'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review, currentUserId, onDelete }) {
  const name = review.user
    ? `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || 'User'
    : 'User'
  const isOwner = currentUserId && review.user?._id === currentUserId

  const date = new Date(review.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.user?.photoUrl ? (
            <img
              src={review.user.photoUrl}
              alt={name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[var(--border-primary)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--accent-bg)] flex items-center justify-center border-2 border-[var(--accent-border)]">
              <UserCircle className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>
          )}
          <div>
            <p className="text-[var(--text-primary)] text-sm font-semibold">{name}</p>
            <p className="text-[var(--text-muted)] text-xs">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} readonly />
          {isOwner && (
            <button
              onClick={() => onDelete(review._id)}
              className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
              aria-label="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-[var(--text-secondary)] text-sm leading-relaxed">{review.comment}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-8 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent-bg)]/20 flex items-center justify-center">
        <MessageSquare className="w-8 h-8 text-[var(--accent-primary)]/60" />
      </div>
      <h3 className="text-[var(--text-primary)] font-semibold text-lg mb-2">No reviews yet</h3>
      <p className="text-[var(--text-secondary)] text-sm">Be the first to share your experience!</p>
    </div>
  )
}

function LoginPrompt() {
  return (
    <div className="text-center py-6 px-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--accent-bg)]/20 flex items-center justify-center">
        <LogIn className="w-6 h-6 text-[var(--accent-primary)]" />
      </div>
      <p className="text-[var(--text-secondary)] text-sm mb-3">Share your experience with others</p>
      <a 
        href="/login" 
        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md"
      >
        <LogIn className="w-4 h-4" />
        Login to write a review
      </a>
    </div>
  )
}

export default function ReviewSection({ monasteryId }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await reviewAPI.getReviews(monasteryId)
      setReviews(data.data || [])
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }, [monasteryId])

  useEffect(() => {
    if (monasteryId) fetchReviews()
  }, [monasteryId, fetchReviews])

  // Pre-fill form if user already has a review
  useEffect(() => {
    if (!user || reviews.length === 0) return
    const mine = reviews.find((r) => r.user?._id === user._id)
    if (mine) {
      setRating(mine.rating)
      setComment(mine.comment)
    }
  }, [reviews, user])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) { toast.error('Please login to submit a review.'); return }
    if (rating === 0) { toast.error('Please select a star rating.'); return }
    if (comment.trim().length < 5) { toast.error('Comment must be at least 5 characters.'); return }

    setSubmitting(true)
    try {
      await reviewAPI.submitReview(monasteryId, { rating, comment: comment.trim() })
      toast.success('Review submitted!')
      await fetchReviews()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      await reviewAPI.deleteReview(monasteryId)
      toast.success('Review deleted.')
      setRating(0)
      setComment('')
      await fetchReviews()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null

  const userAlreadyReviewed = user && reviews.some((r) => r.user?._id === user._id)

  return (
    <section className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-primary)] p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-[var(--accent-primary)]" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Reviews & Ratings</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            {reviews.length > 0 
              ? `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'} from visitors`
              : 'Share your experience with the community'
            }
          </p>
        </div>
      </div>

      {/* Rating Summary */}
      {avgRating && (
        <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--text-primary)]">{avgRating}</div>
            <div className="flex items-center gap-1 mt-1">
              <StarRating value={Math.round(Number(avgRating))} readonly />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-[var(--text-secondary)]">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </div>
            <div className="mt-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(r => Math.round(r.rating) === stars).length
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--text-muted)] w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-[var(--accent-primary)] h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[var(--text-muted)] w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!avgRating && !loading && <EmptyState />}

      {/* Write Review Form */}
      {user ? (
        <div className="mb-6 p-5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center">
              <PenTool className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              {userAlreadyReviewed ? 'Update your review' : 'Write a review'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-3">
                <StarRating value={rating} onChange={setRating} />
                {rating > 0 && (
                  <span className="text-sm text-[var(--text-secondary)] font-medium">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Your Experience
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience visiting this monastery..."
                maxLength={1000}
                rows={4}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg px-4 py-3 text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] resize-none transition-all duration-200"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[var(--text-muted)]">{comment.length}/1000 characters</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting || rating === 0 || comment.trim().length < 5}
                className="px-6 py-2.5 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:hover:shadow-none"
              >
                {submitting ? 'Saving…' : userAlreadyReviewed ? 'Update Review' : 'Submit Review'}
              </button>
              {userAlreadyReviewed && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-medium text-sm transition-all duration-200"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <LoginPrompt />
      )}

      {/* Reviews List */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-[var(--text-primary)] text-lg mb-3">Visitor Reviews</h3>
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={user?._id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}
