
module.exports = async (req, res) => {
  try {
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const token = process.env.DASHBOARD_API_TOKEN;

    if (!scriptUrl || !token) {
      return res.status(500).json({
        success: false,
        error: "Missing Vercel environment variables"
      });
    }

    const url = new URL(scriptUrl);
    url.searchParams.set("token", token);

    const response = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow"
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        success: false,
        error: "Apps Script did not return JSON",
        details: text.slice(0, 300)
      });
    }

    if (!response.ok || data.success === false) {
      return res.status(502).json({
        success: false,
        error: data.error || "Apps Script request failed"
      });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Dashboard API failed"
    });
  }
};

