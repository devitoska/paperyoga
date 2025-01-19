function extractCategoryTree(html){
    let tree = {};
    let children = $(html).find(">li");
    for(let c of children){
        let title = $(c).find(">a").text();
        let tmp = $(c).find(">ul")
        if (tmp.length > 0)
            tree[title] = extractCategoryTree(tmp["0"].outerHTML);
        else
            tree[title] = undefined;
    }
    return tree;
}

function extractQuartile(html, year = undefined){

    function transformQuartile(x){
        ret = x.split(";");
        ret[1] = parseInt(ret[1]);
        return ret;
    }

    function getQuartiles(acc, item){
        // item = [category, year, quartile]

        if (year == undefined){
            if(acc[item[0]] == undefined)
                acc[item[0]] = { "quartile" : item[2], "year" : item[1] };
            else{
                prev_year = acc[item[0]].year;
                if (prev_year < item[1])
                    acc[item[0]] = { "quartile" : item[2], "year" : item[1] };
            }
        }
        else {
            if (item[1] == year)
                acc[item[0]] = { "quartile" : item[2], "year" : item[1] };
        }
        return acc;
    }

    // last quartile for now, for each category
    scriptJS = $(html).filter("script[type='text/javascript']").first().text(); //may change over time with new imports
    // search for "var dataquartiles"
    quartiles = scriptJS.match(/var dataquartiles = "(.*)";/)[1]; // return only the capturing group
    q_list = quartiles.split(/\\n/g);
    q_list.shift()
    q_list = q_list.map(transformQuartile);
    return q_list.reduce(getQuartiles, {});
}

async function journalSearch(html, year, journal){
    // select first link in search results
    let ret = {"title" : journal, "scimagoUrl" : undefined};
    // now we consider only the first result on Scimago
    let queryStringJournal = tc( () => $(html).find(".search_results>a").first().attr("href").split("q=")[1]);
    
    if (queryStringJournal !== undefined){
        let journalUrl = baseUrl + queryStringJournal;
        //console.log("journalUrl = " + journalUrl);
        
        // get journal info
        await $.ajax({
            url: journalUrl,
            type: "GET",
            dataType: "html",
            success:  (html) => {
                let journalInfo = {};
                // get title from html
                journalInfo["scimagoUrl"] = journalUrl;
                journalInfo["title"] = tc( () => $(html).filter("title").text() );
                journalGrid = tc( ()  => $(html).find(".journalgrid").children() );
                journalInfo["country"] = tc( () => $(journalGrid["0"].innerHTML).find("a").first().text());
                categoryTreeHTML = $(journalGrid["1"].outerHTML).find("ul").first()["0"].outerHTML;
                journalInfo["categoryTree"] = tc( () => extractCategoryTree(categoryTreeHTML)); 
                journalInfo["publisher"] = tc( () => $(journalGrid["2"].innerHTML).find("a").first().text());
                journalInfo["hIndex"] = tc( () => parseInt($(journalGrid["3"].outerHTML).find(".hindexnumber").text()) );
                journalInfo["publicationType"] = tc( () => $(journalGrid["4"].outerHTML).find("p").first().text() );
                journalInfo["issn"] = tc( () => $(journalGrid["5"].outerHTML).find("p").first().text() );
                journalInfo["coverage"] = tc( () => $(journalGrid["6"].outerHTML).find("p").first().text() );
                journalInfo["quartiles"] = tc( () => extractQuartile(html) );
                journalInfo["quartilesThatYear"] = tc( () => extractQuartile(html, year) );
                //console.log(journalInfo);
                ret = journalInfo;
            },
            error: function(e){
                console.log("error in second Scimago search" + e);
            }, 
        });
    }
    return ret;
}

async function scimagoSearch(journal, publisher, year){
    
    baseUrl = "https://www.scimagojr.com/journalsearch.php?q=";
    
    //the search is based on journal + publisher, if publisher is not an url
    //only journal, otherwise
    queryString = sanitizeSearchString(journal);

    if (queryString == "" || queryString == undefined)
        return undefined;

    publisher = publisher.trim();
    
    if (!(publisher == "" || publisher == undefined) && !isValidUrl(publisher)){
        publisher = sanitizeSearchString(publisher);
        queryString += "+" + sanitizeSearchString(publisher);
    }

    url = baseUrl + queryString;
    console.log("url = " + url);

    let ret = undefined;

    await $.ajax({
        url: url,
        type: "GET",
        dataType: "html",
        success:  (html) => {
            ret = journalSearch(html, year, journal);
        },
        error: function(e){
            console.log("error in first Scimago search" + e);
        }, 
    });

    return ret;
}