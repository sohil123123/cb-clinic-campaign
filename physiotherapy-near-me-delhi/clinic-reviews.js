// Weekly update: edit the Google Maps rating and review count together.
// Keep both null until the clinic has a reliable figure.
window.cbClinicReviews = {
  gk:         { rating: 4.9, count: 445 },
  safdarjung: { rating: 4.8, count: 938 },
  saket:      { rating: 4.9, count: 747 },
  vasant:     { rating: 4.9, count: 707 },
  dwarka:     { rating: 4.9, count: 119 }
};
// Delhi-wide figure shown in the hero badge. Update it with the clinic rows.
// Remove this block to fall back to the sum of the clinic rows above.
window.cbReviewSummary = { rating: 4.9, count: 2970 };
