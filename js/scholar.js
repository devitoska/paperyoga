async function scholarSearch(id, elem) {
    const data_cid = elem.attr("data-cid");

    const citUrl =
        "https://scholar.google.com/scholar?q=info:" +
        data_cid +
        ":scholar.google.com/&output=cite&scirp=0&hl=en";

    const info = {"id": id};

    try {
        const html = await $.ajax({
            url: citUrl,
            type: "GET",
            dataType: "html"
        });

        const MLACitation = $(html)
            .find("td>div.gs_citr")
            .first()
            .html();

        let ret = extractMLAInfo(MLACitation);
        info.serialTitle = ret.serialTitle;
        info.year = ret.year;
        return info;

    } catch (e) {
        console.error("scholarSearch error:", e);
        return {"id": id, "error": "Failed to retrieve paper info"};
    }
}