async function scholarSearch(elem){

    let title = elem.find("h3>a").first().text().replace(/(\[.*\])/, "").trim();
    let data_cid = elem.attr("data-cid");
    let info = elem.find(".gs_a").text();
    let publisher = info.split("- ")[2].trim();
    let link = elem.find("h3>a").attr("href");
    let citations = parseInt(elem.find(".gs_flb>a").eq(2).text().match(/[0-9]+/)[0]); // if citations == 0 ?
    let journal, year, authors;

    // get complete metadata from popup
    citUrl = "https://scholar.google.com/scholar?q=info:" + 
                data_cid + ":scholar.google.com/&output=cite&scirp=0&hl=en";
    
    await $.ajax({
        url: citUrl,
        type: "GET",
        dataType: "html",
        success: (html) => {
            MLATr = $(html).find("tr")["0"];
            MLA = $(MLATr).find('.gs_citr').text().replace(/<.*>/gm, "").trim();
            // process MLA citation
            parts = MLA.split(/\"/g);
            authors = parts[0].replace(/\./g, "").trim();
            first_author = authors.split(",")[0].trim();
            journal = parts[2].split("(")[0].trim();
            /*pos = journal.indexOf(/[0-9]/)
            if (pos != -1)
                journal = journal.substring(0, pos).trim();    
            */
            year_ = parts[2].split("(")[1].trim();
            year = parseInt(year_.replace(/\).*/,""));
        },
        error: function(e){
            console.log(e);
        }, 
    });

    return {
            title: title, 
            authors: authors,
            first_author: first_author,
            year: year,
            journal : journal,
            citations: citations, 
            publisher: publisher,
            link: link,
            MLA: MLA
        };
}