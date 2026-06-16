// Server-side helper that fetches the BLS data and hands it to the page.
module.exports = async function (req, res) {
  var SERIES = [
    "CUUR0000SA0", "CUSR0000SA0", "CUUR0000SA0L1E", "CUSR0000SA0L1E",
    "LNS14000000", "CES0000000001", "CES0500000003", "LNS11300000"
  ];
  try {
    var endyear = new Date().getFullYear();
    var key = process.env.BLS_API_KEY;
    var version = key ? "v2" : "v1";
    // BLS caps the span per request (10 years without a key, 20 with one).
    // Stay just inside the cap so the current year is never dropped.
    var startyear = endyear - (key ? 19 : 9);
    var body = { seriesid: SERIES, startyear: String(startyear), endyear: String(endyear) };
    if (key) body.registrationkey = key;
    var r = await fetch("https://api.bls.gov/publicAPI/" + version + "/timeseries/data/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    var json = await r.json();
    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");
    res.status(200).json(json);
  } catch (e) {
    res.status(502).json({ status: "ERROR", message: [String(e)] });
  }
};
