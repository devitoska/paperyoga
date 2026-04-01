// display popup
async function displayPopup(){
    // add loader phrases
    let loaderSentences = getLoaderSentences();
    let start = Math.floor(Math.random() * loaderSentences.length);

    let updateSentence = (popup) => {
        popup.find(".loader_sentence").html(loaderSentences[start]);
        start = (start + 1) % loaderSentences.length;
    };

    let interval;

    await $.get(browser.runtime.getURL("html/popup.html"), (popupHTML) => {
        let popup = $(popupHTML);
        
        // sentence event
        updateSentence(popup);
        interval = setInterval( () => updateSentence(popup), 2000); //2seconds sleep

        $("body").css("overflow", "hidden");
        popup.find("#popup_close").click(() => {
            popup.remove();
            $("body").css("overflow", "auto");
        });
        popup.find(".popup_icon").attr("src", browser.runtime.getURL("icons/icon.png"));
        $("body").prepend(popup);
    });

    return interval;
}

// update popup with info after retrieving it
function updatePopup(serialTitle, scopusInfo, icoreInfo){

    $.get(browser.runtime.getURL("html/popup_body.html"), (html) => {
        let popupBody = $(html);

        if(scopusInfo["error"] || icoreInfo["error"]){
            popupBody.find("#error_text").html(
                (scopusInfo["error"]? scopusInfo["error"] : "") + 
                "<br>" + (icoreInfo["error"]? icoreInfo["error"] : ""));
        }

        if (scopusInfo["warning"] || icoreInfo["warning"]){
            popupBody.find("#warning_text").html(
                (scopusInfo["warning"]? scopusInfo["warning"] : "") + 
                "<br>" + (icoreInfo["warning"]? icoreInfo["warning"] : ""));
        }

        if (scopusInfo["type"] && scopusInfo["title"]){
            popupBody.find("#title_div").html(
                `<b>${capitalize(scopusInfo["type"]) + ":"}</b> ${scopusInfo["title"]}`
            );
        }

        if (scopusInfo["publisher"]){
            popupBody.find("#publisher_div").html(
                `<b>Publisher:</b> ${capitalize(scopusInfo["publisher"])}`
            );
        }

        // create table for citescore scopusInfo
        if (scopusInfo["citescore"]){
            let citescoreInfo = scopusInfo["citescore"];
            let NowYear = scopusInfo["NowYear"];
            let PublicationYear = scopusInfo["PublicationYear"] || "N/A";
            let tableHTML = `
                <table class = "cite_table">
                    <tr class = "cite_header">
                        <th class = "cite_header_cell">Subject Area</th>
                        <th class = "cite_header_cell">Latest (${NowYear})</th>
                        <th class = "cite_header_cell">Pub. Year (${PublicationYear})</th>
                    </tr>
            `;

            for (let key in citescoreInfo) {
                NowRank = citescoreInfo[key]["now"] ? citescoreInfo[key]["now"]["rank"] : "N/A";
                PubRank = citescoreInfo[key]["year"] ? citescoreInfo[key]["year"]["rank"] : "N/A";
                NowQuartile = citescoreInfo[key]["now"] ? citescoreInfo[key]["now"]["quartile"] : "N/A";
                PubQuartile = citescoreInfo[key]["year"] ? citescoreInfo[key]["year"]["quartile"] : "N/A";
                tableHTML += `
                    <tr class = "cite_row">
                        <td class = "cite_cell">${key}</td>
                        <td class = "cite_cell"><span class = "${NowQuartile == "N/A" ? "" : "quartile " + NowQuartile}">${NowQuartile}</span>(#${NowRank})</td>
                        <td class = "cite_cell"><span class = "${PubQuartile == "N/A" ? "" : "quartile " + PubQuartile}">${PubQuartile}</span>(#${PubRank})</td>
                    </tr>
                `;
            }

            tableHTML += `</table>`;
            popupBody.find("#citescore_div").html(tableHTML);
        }

        // display ICORE info if exists
        if (icoreInfo["rank"]){
            popupBody.find("#icore_div").html(
                `<b>ICORE Search:</b> ${icoreInfo["title"]}, ${icoreInfo["acronym"]} <br>
                 <b>ICORE Ranking:</b> ${icoreInfo["rank"]}`
            );
        }

        // view more links

        if(scopusInfo["scopusLink"]){
            popupBody.find("#view_more_scopus").html(
                `<a class="view_more_link" href="${scopusInfo["scopusLink"]}" target="_blank">View Scopus</a>`
            );
        }

        if(icoreInfo["icoreLink"]){
            popupBody.find("#view_more_icore").html(
                `<a class="view_more_link" href="${icoreInfo["icoreLink"]}" target="_blank">View ICORE</a>`
            );
        }

        // sanitize serialTitle
        serialTitle = sanitizeTitle(serialTitle);
        let title_acronym = extractAcronym(serialTitle);
        serialTitle = title_acronym.title;

        if (serialTitle){
            
            popupBody.find("#search_scimago").html(
                `<a class="view_more_link" href=https://www.scimagojr.com/journalsearch.php?q=${encodeURIComponent(serialTitle)} target="_blank">Search Scimago</a>`
            );
            popupBody.find("#search_google").html(
                `<a class="view_more_link" href=https://www.google.com/search?q=${encodeURIComponent(serialTitle)} target="_blank">Search Google</a>`
            );
        }
       
        $(".popup_body").html($(popupBody));

    });
}