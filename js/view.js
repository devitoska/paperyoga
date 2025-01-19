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

function updatePopup(info){
    $.get(browser.runtime.getURL("html/popup_body.html"), (html) => {
        console.log(info);
        let popupBody = $(html);
        fields = ['title', 'authors', 'publisher', 'year', 'citations'];
        
        fields.forEach((field) => {
            if(info[field])
                popupBody.find(`#${field}_div`).html(
                    `<b>${capitalize(field)}</b>: ${info[field]}`
                );
        });

        // add link to the paper

        popupBody.find("#title_div").append(
            `<a href="${info.link}"><img class = "link_icon" src = "${browser.runtime.getURL("icons/link.png")}"></a>`
        );

        // add journal info
        
        if (info.journalInfo){
            journalFields = ['title', 'hIndex', 'country', 'coverage', 'issn'];
            journalFields.forEach((field) => {
                if(info.journalInfo[field])
                    popupBody.find(`#journal_${field}_div`).html(
                        `<b>Journal ${field}</b>: ${info.journalInfo[field]}`
                    );
            });

            // view more on scimago
            if (info.journalInfo["scimagoUrl"])
                popupBody.find("#view_more_div").html(
                    `<a href = '${info.journalInfo["scimagoUrl"]}' target="_blank">View more about this journal on Scimago</a>`
                );
            else
                popupBody.find("#view_more_div").html(
                    `Journal not found on Scimago`
                );

            // quartiles
            let quartiles = info.journalInfo['quartiles'];
            let quartilesThatYear = info.journalInfo['quartilesThatYear'];

            if(quartiles){
                    let quartileDiv = popupBody.find("#journal_quartiles_div");
                    quartileDiv.html("<b>Journal quartiles</b>: ");
                    for (let [subject, value] of Object.entries(quartiles)){
                        let quartile = value['quartile'];
                        let year = value['year'];
                        let span = $(`<div><span class='quartile ${quartile}'>${quartile}</span> (${year}) in ${subject}</div>`);
                        quartileDiv.append(span);
                    }
            }

            // quartiles in publication year

            if(quartilesThatYear){
                let quartileDiv = popupBody.find("#journal_quartilesThatYear_div");
                quartileDiv.html("<b>Journal quartiles in publication year</b>: ");
                for (let [subject, value] of Object.entries(quartilesThatYear)){
                    let quartile = value['quartile'];
                    let year = value['year'];
                    let span = $(`<div><span class='quartile ${quartile}'>${quartile}</span> (${year}) in ${subject}</div>`);
                    quartileDiv.append(span);
                }
            }

        }
        
        $(".popup_body").html($(popupBody));

        /*
        // downloadable img for citation in slides
        html2canvas( document.querySelector(".downloadable_img"), {allowTaint:true,useCORS:true}).then( canvas => {
            //document.querySelector(".downloadable_img").innerHTML = "";
            document.body.appendChild(canvas);
        });*/
    });
}