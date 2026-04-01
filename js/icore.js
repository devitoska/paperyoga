async function icoreSearch(serialTitle) {
    let retObj = {};
    serialTitle = sanitizeTitle(serialTitle);
    let title_acronym = extractAcronym(serialTitle);
    let acronym = title_acronym.acronym;
    serialTitle = title_acronym.title;

    if (!serialTitle) {
        // console.warn("Missing parameters for icoreSearch:", {serialTitle});
        retObj["error"] = "ICORE site: Missing information";
        return retObj;
    }

    let baseUrl = "https://portal.core.edu.au/conf-ranks/?";
    let source = "ICORE2026";

    let queryString = `search=${encodeURIComponent(serialTitle)}&by=all&source=${source}&sort=arating`;

    let url = baseUrl + queryString;

    try {
        const response = await fetch(url);
        const htmlText = await response.text();
        
        // parse the HTML response with jQuery
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const $doc = $(doc);

        // extract tr with onclick attribute set to anything
        const rows = $doc.find("tr[onclick]");

        // for each row, extract the onclick attribute (link) 
        // the first td (serial title), the second td (acronym), and the fourth td (rank)

        let minDistance = Infinity;
        let bestResult = null;
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const onclickAttr = $(row).attr("onclick");
            // link is navigate('/conf-ranks/12345') or similar, 
            // we want to extract the /conf-ranks/12345 part
            const linkMatch = onclickAttr.match(/navigate\('([^']+)'\)/);
            const link = linkMatch ? "https://portal.core.edu.au" + linkMatch[1] : null;
            const foundTitle = $(row).find("td:nth-child(1)").text().trim();
            const foundAcronym = $(row).find("td:nth-child(2)").text().trim();
            const rank = $(row).find("td:nth-child(4)").text().trim();
            
            let distance = levenshteinDistance(foundTitle, serialTitle);

            if (distance < minDistance || acronym === foundAcronym) {
                minDistance = distance;
                bestResult = {
                    title: foundTitle,
                    acronym: foundAcronym,
                    rank: rank,
                    link: link
                };
            }

            if (distance == 0 || acronym === foundAcronym) {
                break;
            }
        }

        if (bestResult) {
            retObj["title"] = bestResult.title;
            retObj["acronym"] = bestResult.acronym;
            retObj["rank"] = bestResult.rank;
            retObj["icoreLink"] = bestResult.link;
            if (minDistance > 0) {
                retObj["warning"] = "ICORE results may be inaccurate (Search title: '" + serialTitle + "')";
            }
        }
        else {
            retObj["error"] = "ICORE site: No conference found (Search title: '" + serialTitle + "')";
        }
        
    } catch (error) {
        // console.error("Error fetching ICORE data:", error);
        retObj["error"] = "ICORE site: Error retrieving data";
    }

    return retObj;
}
