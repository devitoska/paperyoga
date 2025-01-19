function setButtons (){
    elems = $("#gs_res_ccl_mid>.gs_r.gs_or.gs_scl[data-cid]");
    keys = Object.keys(elems);
    keys.pop();
    keys.pop();
    elems = keys.map((key) => elems[key]);

    function retrieveData(elem, idx){
        return async function(){
            interval = displayPopup();
            let info = await scholarSearch($(elem));
            info["id"] = idx;
            let journalInfo = await scimagoSearch(info.journal, info.publisher, info.year);
            info["journalInfo"] = journalInfo;
            clearInterval(interval);
            updatePopup(info);
            // popup or something else here
        }
    }

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