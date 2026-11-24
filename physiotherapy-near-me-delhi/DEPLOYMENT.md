# CB Physiotherapy Delhi campaign
Final Google Ads destination: https://cbphysiotherapy.in/book/physiotherapy-near-me-delhi

Copy the included book/physiotherapy-near-me-delhi directory into the public document root, merging only this directory. Serve the included index.html as a standalone HTML response at the exact URL above using an internal route or rewrite. If the server automatically redirects physical directories to a trailing slash, serve the exact route from the application or an exact-match web-server location. Allow the files beneath that route to be served directly. Keep query parameters such as gclid and utm_campaign intact. No build or Node runtime is required.

Example Nginx configuration inside the existing server block, assuming its root is the public document root:
    location = /book/physiotherapy-near-me-delhi {
        try_files /book/physiotherapy-near-me-delhi/index.html =404;
    }
    location ^~ /book/physiotherapy-near-me-delhi/ {
        try_files $uri =404;
    }

Keep the page-specific noindex, follow tag. Exclude the campaign URL from the sitemap and allow crawling. Preserve existing SEO routes. Map tiles and external review, profile and WhatsApp links require Internet access.

Before advertising:
- The supplied booking flow is a demonstration. Connect form submission to your lead system, show success only after a saved lead, and keep WhatsApp optional.
- Connect your Google Ads or GTM account and test one conversion per saved request. Keep names, phone numbers, health concerns and WhatsApp message content out of analytics.
- Verify the displayed ratings and counts against each Google clinic listing. The combined review badge uses preview figures.
- Test the exact URL with a query string on a mobile device. Check all four care cards, five map pins and clinic selections, fees, Book Now popup, call and WhatsApp links. Confirm that CSS, images and scripts return 200 and that page source contains noindex.

Weekly Google review updates: edit clinic-reviews.js, upload it, then clear its cache. Four initial rows use HealthFinder Google listing snapshots, not live checks. Confirm against Maps. Dwarka is pending. Once all five rows are complete, the hero displays the sum and count-weighted mean rounded to one decimal. Check each profile using its clinic-card link.
