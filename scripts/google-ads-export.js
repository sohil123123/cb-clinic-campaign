// CB Physiotherapy: nightly export of Google Ads performance to the landing dashboard.
//
// Where it runs: inside the Google Ads account (Tools > Scripts), not on our server.
// What it sends: per day, per campaign / keyword / search term / user location:
// impressions, clicks, cost (INR) and Google conversions. No personal data.
// Where it goes: POST /api/landing/ads on cbphysiotherapy.in (see README, "Spend feed").
//
// Install (once, about five minutes):
//  1. Google Ads > Tools > Scripts > + > paste this file. Name it "Landing dashboard feed".
//  2. Replace TOKEN below with the ADS_FEED_TOKEN value from Sohil (kept in the Laravel .env).
//     The token lives only here and in .env; never put it in the repository.
//  3. Click Authorise, then Preview once. The log should show "sent N rows, HTTP 200/204".
//  4. For the first run set DAYS_BACK = 90, run it, then set it back to 3.
//  5. Schedule: Frequency "Daily", at 05:00 (account time). Three days are re-sent each
//     night because Google keeps adjusting conversions and clicks for a few days.

var ENDPOINT = 'https://cbphysiotherapy.in/api/landing/ads';
var TOKEN = 'PASTE_THE_ADS_FEED_TOKEN_HERE';
var DAYS_BACK = 3;
var EXCLUDE_CAMPAIGNS = /jaya|bengaluru|bangalore/i; // campaigns of other cities in the same account
var CHUNK = 400;

function main() {
  var tz = AdsApp.currentAccount().getTimeZone();
  var to = new Date(), from = new Date();
  to.setDate(to.getDate() - 1);               // yesterday
  from.setDate(from.getDate() - DAYS_BACK);
  var range = {from: fmt(from, tz), to: fmt(to, tz)};
  var between = ' segments.date BETWEEN "' + range.from + '" AND "' + range.to + '"';
  var rows = [];

  rows = rows.concat(pull('campaign',
    'SELECT segments.date, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions ' +
    'FROM campaign WHERE' + between + ' AND campaign.status != "REMOVED" AND metrics.impressions > 0',
    function (r) { return {key: r.campaign.name}; }));

  rows = rows.concat(pull('keyword',
    'SELECT segments.date, campaign.name, ad_group.name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ' +
    'ad_group_criterion.status, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions ' +
    'FROM keyword_view WHERE' + between + ' AND metrics.impressions > 0',
    function (r) { return {key: r.adGroupCriterion.keyword.text, match_type: low(r.adGroupCriterion.keyword.matchType), status: low(r.adGroupCriterion.status), ad_group: r.adGroup.name}; }));

  rows = rows.concat(pull('search_term',
    'SELECT segments.date, campaign.name, ad_group.name, search_term_view.search_term, search_term_view.status, segments.search_term_match_type, ' +
    'metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions ' +
    'FROM search_term_view WHERE' + between + ' AND metrics.impressions > 0',
    function (r) { return {key: r.searchTermView.searchTerm, match_type: low(r.segments.searchTermMatchType), status: low(r.searchTermView.status), ad_group: r.adGroup.name}; }));

  // Physical location of the searcher, as a Google location ID: the same ID the pages receive as loc={loc_physical_ms}.
  rows = rows.concat(pull('location',
    'SELECT segments.date, campaign.name, segments.geo_target_most_specific_location, ' +
    'metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions ' +
    'FROM user_location_view WHERE' + between + ' AND metrics.impressions > 0',
    function (r) { return {key: String(r.segments.geoTargetMostSpecificLocation || '').replace('geoTargetConstants/', '')}; }));

  Logger.log(range.from + ' to ' + range.to + ': ' + rows.length + ' rows');
  if (!rows.length) return;
  for (var i = 0; i < rows.length; i += CHUNK) {
    var chunk = rows.slice(i, i + CHUNK);
    var res = UrlFetchApp.fetch(ENDPOINT, {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: {Authorization: 'Bearer ' + TOKEN},
      payload: JSON.stringify({v: 1, source: 'google-ads-script', from: range.from, to: range.to, rows: chunk})
    });
    var code = res.getResponseCode();
    Logger.log('sent ' + chunk.length + ' rows, HTTP ' + code + (code >= 300 ? ' ' + res.getContentText().slice(0, 200) : ''));
    if (code >= 300) throw new Error('Upload failed with HTTP ' + code + '. Check the token and the endpoint.');
  }
}

// Runs one GAQL query and maps each result row to the feed shape.
function pull(kind, gaql, extra) {
  var out = [], it = AdsApp.search(gaql);
  while (it.hasNext()) {
    var r = it.next();
    var campaign = r.campaign ? r.campaign.name : '';
    if (EXCLUDE_CAMPAIGNS.test(campaign)) continue;
    var e = extra(r);
    if (!e.key) continue;
    out.push({
      date: r.segments.date, kind: kind, campaign: campaign, ad_group: e.ad_group || '',
      key: String(e.key).slice(0, 200), match_type: e.match_type || '', status: e.status || '',
      impressions: num(r.metrics.impressions), clicks: num(r.metrics.clicks),
      cost: Math.round(num(r.metrics.costMicros) / 10000) / 100, conversions: Math.round(num(r.metrics.conversions) * 100) / 100
    });
  }
  Logger.log(kind + ': ' + out.length + ' rows');
  return out;
}

function num(v) { return parseFloat(v) || 0; }
function low(v) { return String(v || '').toLowerCase(); }
function fmt(d, tz) { return Utilities.formatDate(d, tz, 'yyyy-MM-dd'); }
