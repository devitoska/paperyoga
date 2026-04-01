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

function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;

  // Create a 2D array (matrix)
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1));

  // Initialize base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,     // deletion
        dp[i][j - 1] + 1,     // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

function sanitizeTitle(title) {
    if (typeof title !== "string") return "";

    return title
        // remove 'Proceedings of the'
        .replace(/Proceedings of the/gi, "")
        // replace &amp; with "and"
        .replace(/&amp;/g, "and")
        // remove html special characters
        .replace(/&[^;]+;/g, "")
        // remove ordinal numbers (1st, 2nd, 3rd, 4th, etc.)
        .replace(/\b\d+(st|nd|rd|th)\b/gi, "")
        // remove remaining numbers
        .replace(/\d+/g, "")
        //remove non alphanumeric characters except ' and spaces
        .replace(/[^a-zA-Z0-9\s']/g, "")
        // collapse multiple spaces into one
        .replace(/\s+/g, " ")
        // trim leading/trailing whitespace
        .trim();
}

function extractAcronym(title) {

    // extract acronym from serial title if it exists, by taking capital letters
    let acronymMatch = title.match(/\b[A-Z]{2,}\b/g);
    
    // Filter out forbidden acronyms
    if (acronymMatch) {
        // add other false positive acronyms to this list if needed
        falsePositiveAcronyms = ["IEEE", "ACM"];
        acronymMatch = acronymMatch.filter(word => !falsePositiveAcronyms.includes(word));
    }

    let acronym = null;

    // Only define acronym if matches exist and are all identical
    if (acronymMatch && acronymMatch.length > 0) {
        const firstMatch = acronymMatch[0];
        const allMatchesEqual = acronymMatch.every(match => match === firstMatch);
        
        if (allMatchesEqual) {
            acronym = firstMatch;
        }
    }

    // remove all occurrences of acronym from serial title for better search results
    // if (acronym) {
    //   title = title.replace(new RegExp(`\\b${acronym}\\b`, 'g'), "").trim();
    // }

    // remove parentheses and their contents for better search results
    title = title.replace(/\([^)]*\)/g, "").trim();

    return {title: title, acronym: acronym };
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

function extractMLAInfo(htmlCitation) {
    // 1. Define the regex:
    // <i>(.*?)<\/i>  -> Captures everything inside the italics (the serialTitle)
    // .*?             -> Matches any characters in between lazily
    // (\d{4})         -> Captures the first occurrence of exactly 4 digits (the year)
    const mlaRegex = /<i>(.*?)<\/i>.*?(\d{4})/;
    
    const match = htmlCitation.match(mlaRegex);

    if (match) {
        return {
            serialTitle: match[1].trim(),
            year: match[2].trim()
        };
    }

    // Default return if no match is found
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