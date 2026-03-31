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
            let scholarInfo = await scholarSearch(idx, $(elem));
            // search journal/conference on scopus
            let scopusInfo = await scopusSearch(scholarInfo.serialTitle, scholarInfo.year);           
            clearInterval(interval);
            updatePopup(scopusInfo);
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