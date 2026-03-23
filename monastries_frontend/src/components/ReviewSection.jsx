import { useState, useEffect, useCallback } from 'react'
import { Star, Trash2, MessageSquare, UserCircle } from 'lucide-react'
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
                ? 'fill-amber-400 text-amber-400'
                : 'text-stone-600'
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
    <div className="p-4 rounded-xl bg-stone-900/60 border border-amber-900/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {review.user?.photoUrl ? (
            <img
              src={review.user.photoUrl}
              alt={name}
              className="w-9 h-9 rounded-full object-cover border border-amber-700/50"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-amber-900/50 flex items-center justify-center border border-amber-700/50">
              <UserCircle className="w-5 h-5 text-amber-400" />
            </div>
          )}
          <div>
            <p className="text-amber-100 text-sm font-semibold">{name}</p>
            <p className="text-stone-500 text-xs">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} readonly />
          {isOwner && (
            <button
              onClick={() => onDelete(review._id)}
              className="text-stone-500 hover:text-red-400 transition-colors p-1 rounded"
              aria-label="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-stone-300 text-sm leading-relaxed">{review.comment}</p>
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
    <section className="glass rounded-2xl p-6">
      <h2 className="font-heading text-xl font-bold text-amber-50 mb-1 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" /> Reviews & Ratings
      </h2>

      {/* Summary */}
      {avgRating && (
        <div className="flex items-center gap-2 mb-5">
          <span className="text-3xl font-bold text-amber-400">{avgRating}</span>
          <div>
            <StarRating value={Math.round(Number(avgRating))} readonly />
            <p className="text-stone-500 text-xs mt-0.5">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      )}
      {!avgRating && !loading && (
        <p className="text-stone-500 text-sm mb-5">No reviews yet. Be the first!</p>
      )}

      {/* Write / edit a review */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl bg-stone-900/60 border border-amber-900/30 space-y-3">
          <p className="text-amber-200 text-sm font-semibold">
            {userAlreadyReviewed ? 'Update your review' : 'Write a review'}
          </p>
          <div className="flex items-center gap-2">
            <StarRating value={rating} onChange={setRating} />
            {rating > 0 && (
              <span className="text-stone-400 text-xs">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </span>
            )}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience visiting this monastery..."
            maxLength={1000}
            rows={3}
            className="w-full bg-stone-950/60 border border-stone-700/60 rounded-lg px-3 py-2 text-stone-200 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-600/60 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-stone-600 text-xs">{comment.length}/1000</span>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 text-sm font-semibold transition-colors"
            >
              {submitting ? 'Saving…' : userAlreadyReviewed ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-stone-500 text-sm mb-5">
          <a href="/login" className="text-amber-400 hover:text-amber-300 underline">Login</a> to write a review.
        </p>
      )}

      {/* List of reviews */}
      {loading && (
        <p className="text-stone-500 text-sm">Loading reviews…</p>
      )}
      {!loading && reviews.length > 0 && (
        <div className="space-y-3">
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
