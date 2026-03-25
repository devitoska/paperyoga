function setButtons (){
    // get all search result elements
    elems = $("#gs_res_ccl_mid>.gs_r.gs_or.gs_scl[data-cid]");
    keys = Object.keys(elems);
    keys.pop();
    keys.pop();
    elems = keys.map((key) => elems[key]);

    // retrieve info and display popup
    function retrieveData(elem, idx){
        return async function(){
            interval = displayPopup();
            let info = await scholarSearch(idx, $(elem));
            
            // if it's an article, we can try to get journal info from scimago
            if (info.type == "article" && info.journal !== undefined)
                info["journalInfo"] = await scimagoSearch(info.journal, info.year);
                
            clearInterval(interval);
            updatePopup(info);
            // popup or something else here
        }
    }

    // add button to each element
    elems.forEach( (elem, idx) => {
        // add button if not already present
        if ($(elem).find("img.detail-link").length > 0)
            return;
        let imgSrc = browser.runtime.getURL("icons/icon.png");
        let img = $(`<img class = "detail-link" src = "${imgSrc}">`);
        $(img).click(retrieveData(elem, idx));
        $($(elem).find("h3.gs_rt")["0"]).prepend(img);
    });

}

$(document).ready(
    async () => {
        //console.log("You are running jQuery version: " + $.fn.jquery);
        //console.log("UUID: " + getUUID());
        console.log("ready");
        setButtons();
});