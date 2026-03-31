async function getApiKey() {
  try {
    const result = await browser.storage.local.get("scopusApiKey");
    
    // Check if the key exists in the returned object
    if (result.scopusApiKey) {
      return result.scopusApiKey;
    }
    
    return null;
  } catch (error) {
    console.error("Error accessing storage:", error);
    return null;
  }
}

function sanitizeTitle(title) {
    if (typeof title !== "string") return "";

    return title
        // remove parentheses and their contents
        .replace(/\([^)]*\)/g, "")
        // remove ordinal numbers (1st, 2nd, 3rd, 4th, etc.)
        .replace(/\b\d+(st|nd|rd|th)\b/gi, "")
        // remove remaining numbers
        .replace(/\d+/g, "")
        // remove non-alphanumeric characters except spaces
        .replace(/[^a-zA-Z\s]/g, "")
        // collapse multiple spaces into one
        .replace(/\s+/g, " ")
        // trim leading/trailing whitespace
        .trim();
}

function percentileToQuartile(percentile) {
    if (percentile >= 75) {
        return "Q1";
    } else if (percentile >= 50) {
        return "Q2";
    } else if (percentile >= 25) {
        return "Q3";
    } else {
        return "Q4";
    }
}

// Extract journal/conference title and publication year from an MLA citation.
// Handles optional HTML tags and both comma-based and parenthesized year patterns.
function extractMLAInfo(htmlCitation) {
    // 1. Remove HTML tags (e.g., <i>, <b>, <span>)
    // This regex looks for anything between < and > and replaces it with an empty string.
    const cleanCitation = htmlCitation.replace(/<[^>]*>/g, '');

    // 2. Define the extraction regex
    // Looks for: "Article Title" [Journal/Conference Name] (Year)
    const mlaRegex = /"[^"]+"\s*(.*?)[.,\s\(]+(\d{4})(?!\d)/;
    const match = cleanCitation.match(mlaRegex);

    if (match) {
        let containerSegment = match[1].trim();
        // 3. Post-processing to remove Publisher/Metadata
        // We split by the first period or comma and take the first part.
        const serialTitle = containerSegment.split(/[.,]/)[0].trim();
        return {
            serialTitle: serialTitle,
            year: match[2]
        };
    }

    return {
        serialTitle: "",
        year: ""
    };
}

// checks if a string is a valid URL
function isValidUrl(string){
    let urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
        '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
      return !!urlPattern.test(string);
}

// returns the UUID of the extension
function getUUID(){
    return browser.runtime.getURL('/');
}

// capitalizes the first letter of a string
function capitalize(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// return shuffled array of sentences for the loader
function getLoaderSentences(){
    let sentences = [
        "Staring blankly at editor's comments ...",
        "Submitting to the wrong journal...",
        "Rewriting the conclusion for the nth time...",
        "Pretending the submission deadline isn't tomorrow...",
        "Adding \'future work\' because it\'s not done yet...",
        "Citing your own papers for self-esteem...",
        "Googling: \'How to reply to Reviewer 2 politely\'...",
        "Realizing half your references are outdated...",
        "Turning paper rejection into motivation (or tears)...",
        "Discovering the \'innovative\' idea is from 1998...",
        "Phrasing \'we got lucky\' as \'unexpected findings\'...",
        "Answering research questions with more questions...",
        "Measuring experiment success in coffee cups consumed...",
        "Trying to remember why you chose this field...",
        "Waiting for editor's review ...",
      ];
    // shuffle sentences using Durstenfeld
    for (let i = sentences.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sentences[i], sentences[j]] = [sentences[j], sentences[i]];
    }
    return sentences;
}