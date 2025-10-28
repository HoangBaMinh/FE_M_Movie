export default function MovieReviews({
  movie,
  movieError,
  averageRating,
  reviewCount,
  reviewLoading,
  reviews,
  reviewHasMore,
  onLoadMore,
  reviewError,
}) {
  return (
    <section className="movie-detail-section" id="reviews">
      <div className="section-header">
        <h2>Bình luận</h2>
        {reviewError ? (
          <span className="section-error">{reviewError}</span>
        ) : null}
      </div>

      {!movie || movieError ? (
        <div className="movie-detail-state">
          Vui lòng chọn phim hợp lệ để xem bình luận.
        </div>
      ) : (
        <>
          <div className="movie-detail-review-summary">
            {averageRating != null ? (
              <div className="movie-detail-review-score">
                <span className="movie-detail-review-score-value">
                  {averageRating}
                </span>
                <span className="movie-detail-review-score-max">/10</span>
              </div>
            ) : (
              <div className="movie-detail-review-score movie-detail-review-score--empty">
                Chưa có đánh giá
              </div>
            )}
            <div className="movie-detail-review-meta">
              {reviewCount != null ? (
                <span>{reviewCount.toLocaleString("vi-VN")} lượt đánh giá</span>
              ) : (
                <span>Hãy là người đầu tiên đánh giá!</span>
              )}
            </div>
          </div>

          {reviewLoading && reviews.length === 0 ? (
            <div className="movie-detail-state">Đang tải bình luận...</div>
          ) : reviews.length === 0 ? (
            <div className="movie-detail-state">
              Chưa có bình luận nào cho phim này.
            </div>
          ) : (
            <ul className="movie-detail-review-list">
              {reviews.map((review) => (
                <li
                  key={
                    review.id ||
                    `${review.userId || "user"}-${
                      review.createdAt || review.createdDate
                    }`
                  }
                  className="movie-detail-review-item"
                >
                  <div className="movie-detail-review-header">
                    <div className="movie-detail-review-author">
                      <span className="movie-detail-review-name">
                        {review.userName ||
                          review.authorName ||
                          review.createdByName ||
                          "Người dùng ẩn danh"}
                      </span>
                      {review.createdAt || review.createdDate ? (
                        <span className="movie-detail-review-date">
                          {new Date(
                            review.createdAt || review.createdDate
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      ) : null}
                    </div>
                    {review.rating != null ? (
                      <span className="movie-detail-review-rating">
                        {Number(review.rating).toFixed(1)} / 10
                      </span>
                    ) : null}
                  </div>
                  {review.title ? (
                    <p className="movie-detail-review-title">{review.title}</p>
                  ) : null}
                  <p className="movie-detail-review-body">
                    {review.content || review.comment || review.body}
                  </p>
                  {review.likes != null || review.helpfulCount != null ? (
                    <div className="movie-detail-review-footer">
                      <span>
                        Hữu ích:{" "}
                        {(
                          review.helpfulCount ??
                          review.likes ??
                          0
                        ).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {reviewHasMore ? (
            <div className="movie-detail-review-actions">
              <button
                type="button"
                className="movie-detail-action primary"
                onClick={onLoadMore}
                disabled={reviewLoading}
              >
                {reviewLoading ? "Đang tải..." : "Xem thêm bình luận"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
