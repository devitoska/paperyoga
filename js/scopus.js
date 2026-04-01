function getCitescoreInfo(citescoreInfo, codeToSubject) {
    let retObj = {};
    retObj["year"] = citescoreInfo["@year"];
    let tmp = citescoreInfo["citeScoreInformationList"][0]["citeScoreInfo"][0];
    retObj["citeScore"] = tmp["citeScore"];
    retObj["details"] = [];

    for (let i=0; i < tmp["citeScoreSubjectRank"].length; i++) {
        let item = tmp["citeScoreSubjectRank"][i];
        let code = item["subjectCode"];
        retObj["details"].push({ subject: codeToSubject[code], 
                                rank: item["rank"],
                                percentile : item["percentile"] });
    }

    return retObj;
}

async function scopusSearch(serialTitle, year) {

    // sanitize serialTitle
    serialTitle = sanitizeTitle(serialTitle);
    let title_acronym = extractAcronym(serialTitle);
    serialTitle = title_acronym.title;

    const apiKey = await getApiKey();
    let retObj = {};
    
    if (!apiKey) {
        // console.warn("API key not set for scopusSearch");
        retObj["error"] = "Scopus API: API key not set";
        return retObj;
    }

    if (!serialTitle || !year) {
        // console.warn("Missing parameters for scopusSearch:", {serialTitle, year});
        retObj["error"] = "Scopus API: Missing information";
        return retObj;
    }

    let baseUrl = "https://api.elsevier.com/content/serial/title?";

    let view = "CITESCORE";
    let count = 20;
    
    let queryString = `title=${encodeURIComponent(serialTitle)}&view=${view}&count=${count}`;
    let url = baseUrl + queryString;

    // do ajax get request to scopus API, setting the API key in the header X-ELS-APIKey

    try {
        const response = await $.ajax({
            url: url,
            type: "GET",
            headers: {
                //"Accept": "application/json",
                "X-ELS-APIKey": apiKey
            }
        });


       // get error if it exists in response["serial-metadata-response"]["error"]

        if (response["serial-metadata-response"]["error"]) {
            retObj["error"] = "Scopus API: " + response["serial-metadata-response"]["error"] + " (Search title: '" + serialTitle + "')";
        }
        else{
            let minDistance = Infinity;
            let minDistanceIdx = -1;

            for (let i=0; i < response["serial-metadata-response"]["entry"].length; i++) {
                let entry = response["serial-metadata-response"]["entry"][i];
                let distance = levenshteinDistance(entry["dc:title"].trim().toLowerCase(), serialTitle.trim().toLowerCase());
                if (distance < minDistance) {
                    minDistance = distance;
                    minDistanceIdx = i;
                }
                if (distance == 0) 
                    break;
            }
            
            if (minDistance > 0) {
               retObj["warning"] = "Scopus results may be inaccurate (Search title: '" + serialTitle + "')";
            }

            let entry = response["serial-metadata-response"]["entry"][minDistanceIdx];
            retObj["title"] = entry["dc:title"];
            retObj["publisher"] = entry["dc:publisher"];
            retObj["type"] = entry["prism:aggregationType"];

            // if type is conferenceproceeding, change to conference for better display
            if (retObj["type"] == "conferenceproceeding")
                retObj["type"] = "conference";

            retObj["issn"] = entry["prism:issn"];
            //retObj["SNIP"] = entry["SNIPList"]["SNIP"][0]["$"];
            //retObj["SJR"] = entry["SJRList"]["SJR"][0]["$"];

            let codeToSubject = {};
            for (let i=0; i < entry["subject-area"].length; i++) {
                codeToSubject[entry["subject-area"][i]["@code"]] = entry["subject-area"][i]["$"];
            }

            if (entry["citeScoreYearInfoList"]) {
                let citescoreList = entry["citeScoreYearInfoList"]["citeScoreYearInfo"];
                let citescoreNow = getCitescoreInfo(citescoreList[0], codeToSubject);
                let citescoreYear = null;

                for (let i = 0; i < citescoreList.length; i++) {
                    if (citescoreList[i]["@year"] == year) {
                        citescoreYear = getCitescoreInfo(citescoreList[i], codeToSubject);
                        break;
                    }
                }
                
                retObj["citescore"] = {}
                retObj["NowYear"] = citescoreNow["year"];
                retObj["PublicationYear"] = year;

                for (let i=0; i < citescoreNow["details"].length; i++) {
                    let item = citescoreNow["details"][i];
                    retObj["citescore"][item["subject"]] = {
                        "now" : {
                            "rank": item["rank"],
                            "quartile": percentileToQuartile(item["percentile"])
                        }
                    };
                }

                if (citescoreYear) {
                    for (let i=0; i < citescoreYear["details"].length; i++) {
                        let item = citescoreYear["details"][i];
                        retObj["citescore"][item["subject"]]["year"] = {
                            "rank": item["rank"],
                            "quartile": percentileToQuartile(item["percentile"])
                        };
                    }
                }

            }

            let links = entry["link"];
            for (let i=0; i < links.length; i++) {
                if (links[i]["@ref"] == "scopus-source") {
                    retObj["scopusLink"] = links[i]["@href"];
                    break;
                }
            }

        }
    
    } catch (e) {
        console.error("scopusSearch error:", e);
        retObj["error"] = "Scopus API: Error retrieving data";
        if (e.responseText) {
            retObj["error"] += " (" + e.responseText + ")";
        }
        return retObj;
    }

    return retObj;

}