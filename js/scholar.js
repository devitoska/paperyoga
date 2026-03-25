// Helper to extract a BibTeX field
function getField(data, field) {
    const re = new RegExp(
        field + String.raw`\s*=\s*[{"]([\s\S]*?)[}"],?\n`,
        "i"
    );
    const match = data.match(re);
    return match ? match[1].trim() : undefined;
}

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

        const bibtexLink = $(html)
            .find("a.gs_citi")
            .filter(function () {
                return $(this).text().trim().toLowerCase() === "bibtex";
            })
            .attr("href");

        if (!bibtexLink) {
            throw new Error("BibTeX link not found in Scholar cite popup.");
        }

        //console.log("bibtexUrl =", bibtexLink);

        const data = await $.ajax({
            url: bibtexLink,
            type: "GET",
            dataType: "text"
        });

        //console.log("bibtex data =", data);

        // Parse BibTeX entry type
        const typeMatch = data.match(/^@(\w+)\s*\{/m);
        info.type = typeMatch ? typeMatch[1].toLowerCase() : null;

        info.title = getField(data, "title");
        info.authors = getField(data, "author");
        info.year = getField(data, "year");
        info.publisher = getField(data, "publisher");

        if (info.type === "article") {
            info.journal = getField(data, "journal");
        }

        if (info.type === "inproceedings") {
            info.conference = getField(data, "booktitle");
        }
        return info;
    } catch (e) {
        console.error("scholarSearch error:", e);
        return {"id": id, "error": "Failed to retrieve paper info"};
    }
}