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
function updatePopup(info){
    $.get(browser.runtime.getURL("html/popup_body.html"), (html) => {
        let popupBody = $(html);

        if(info["error"]){
            popupBody.find("#error_text").html(info["error"]);
        }

        if (info["warning"]){
            popupBody.find("#warning_text").html(info["warning"]);
        }

        if (info["type"] && info["title"]){
            popupBody.find("#title_div").html(
                `<b>${capitalize(info["type"]) + ":"}</b> ${info["title"]}`
            );
        }

        if (info["publisher"]){
            popupBody.find("#publisher_div").html(
                `<b>Publisher:</b> ${capitalize(info["publisher"])}`
            );
        }
        
        // populate citescore year info
        if(info["citescoreYear"]){
            content = `<br> <b>Citescore Publication Year</b> (${info["citescoreYear"]["year"]}) : ${info["citescoreYear"]["citeScore"]}`;
            for (let i=0; i < info["citescoreYear"]["details"].length; i++) {
                item = info["citescoreYear"]["details"][i];
                quartile = percentileToQuartile(item["percentile"]);
                if (info["type"] === "journal")
                    content += `<br> #${item["rank"]} in ${item["subject"]} <span class="quartile ${quartile}">${quartile}</span> (${item["percentile"]} percentile)`;
                else
                    content += `<br> #${item["rank"]} in ${item["subject"]} (${item["percentile"]} percentile)`;
            }
            popupBody.find("#citescore_year_div").html(content);
        }

        // populate citescore info now
        if(info["citescoreNow"]){
            content = `<br> <b>Citescore Latest</b> (${info["citescoreNow"]["year"]}) : ${info["citescoreNow"]["citeScore"]}`;
            for (let i=0; i < info["citescoreNow"]["details"].length; i++) {
                item = info["citescoreNow"]["details"][i];
                quartile = percentileToQuartile(item["percentile"]);
                if (info["type"] === "journal")
                    content += `<br> #${item["rank"]} in ${item["subject"]} <span class="quartile ${quartile}">${quartile}</span> (${item["percentile"]} percentile)`;
                else
                    content += `<br> #${item["rank"]} in ${item["subject"]} (${item["percentile"]} percentile)`;
            }

            popupBody.find("#citescore_now_div").html(content);
        }

        if(info["scopusLink"]){
            popupBody.find("#view_more_div").html(
                `<a href="${info["scopusLink"]}" target="_blank">View more on Scopus</a>`
            );
        }
       
        $(".popup_body").html($(popupBody));

    });
}