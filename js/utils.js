// sanitizes a search string by replacing dots with spaces, removing non-alphanumeric characters (except for spaces and hyphens), and replacing spaces with plus signs
function sanitizeSearchString(string){
    if (string == undefined)
        return undefined;
    return string.replace(/\./," ").replace(/[^a-zA-Z0-9 \-]/g, "").replace(/ /g, '+');
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

// try-catch wrapper
function tc(fun, defaultVal = undefined){
    try{
        return fun();
    }
    catch(e){
        console.log("error in tc\nlog:" + e);
        return defaultVal;
    }
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