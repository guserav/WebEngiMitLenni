/**
 * Created by erik on 09.07.2017.
 */


/**
 * Counts the occurrences  of the subString in string
 * @param {String} string the string to check
 * @param {String} subString the subString to find
 *
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function countOccurrences(string, subString) {
    let n = 0;
    let pos = 0;
    let step =  subString.length;

    while (pos <= string.length) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            n = n + 1;
            pos += step;
        } else break;
    }
    return n;
}


module.exports = {
    /**
     * Gets a String of input and converts it to html by the rules of our styling it also adds line breaks to the message
     * TODO add documentation for users and for Gerrit
     * *text* gets wrapped in a span: <span class="emphasis" />
     * ~text~ gets wrapped in a span: <span class="strike" />
     * _text_ gets wrapped in a span: <span class="italic" />
     *
     * # prefixed lines into heading of form <span class="heading hX">text</span>
     *
     * --- or *** or * * *  or - - - into a horizontal line
     *
     * `text` wrapped in span: <span class="codeInLine" />
     *
     * > formats the following line as quote: <span class="quote" />
     *
     *  ```
     *  block
     *  ```
     *  wrapped in to <p class="codeBlock">block</p>
     *
     *  everything in a code block is not formatted with the rules above
     *
     * @param {String} string
     * @returns {String}
     */
    applyStyling:function (string) {
        let lines = string.split(/\n/);
        let result = '';
        let inCodeBlock = false;
        let quoteLevel = 0;
        for(let i = 0; i < lines.length; i++){
            if(!inCodeBlock){
                if(/^([-*] ?){3,}$/g.test(lines[i])){
                    result += '<hr />';
                    continue;
                }
                //emphasis text
                lines[i] = lines[i].replace(/\*([^*]+)\*/g, '<span class="emphasis">$1</span>');

                //strike through text
                lines[i] = lines[i].replace(/~([^~]+)~/g, '<span class="strike">$1</span>');

                //italic text
                lines[i] = lines[i].replace(/_([^_]+)_/g, '<span class="italic">$1</span>');

                //inline Code
                lines[i] = lines[i].replace(/`([^`]+)`/g, '<span class="codeInLine">$1</span>');

                const quoteLevelThisLine = countOccurrences((/(&gt;)*/g.exec(lines[i]) || [''])[0],'&gt;');
                if(quoteLevelThisLine !== quoteLevel){
                    for(let j = quoteLevel; j < quoteLevelThisLine; j++){
                        result += '<span class="quote">';
                    }
                    for(let j = quoteLevel; j > quoteLevelThisLine; j--){
                        result += '</span>';
                    }
                    quoteLevel = quoteLevelThisLine;
                }

                if(/(^|(>+)) ?#{1,6}.+$/g.test(lines[i])){
                    const headingType = countOccurrences(/#{1,6}/.exec(lines[i])[0], '#');
                    result += lines[i].replace(/(^|(>+)) ?#{1,6}(.+?)#*$/g, '<span class="heading h"' + headingType + '>$3</span>');
                    continue;
                }
            }
            if(/^(>*) ?```$/.test(lines[i])){
                if(!inCodeBlock){//start Code block
                    result += '<p class="codeBlock">';
                } else {//end Code block
                    result += '</p>';
                }
                inCodeBlock = !inCodeBlock;
            } else {
                if(inCodeBlock){
                    result += lines[i] + '\n';
                } else {
                    result += lines[i] + '<br />';
                }
            }
        }
        result = result.replace(/<br \/>$/g, '');

        //close left open tags
        if(inCodeBlock){
            result += '</p>';
            console.log("i was also here and ended a paragraph");
        }
        for(let j = quoteLevel; j > 0; j--){
            result += '</span>';
        }
        return result; //removes last linebreak that ist not wished to be in
    },

    /**
     * Removes every Character not allowed in HTML and replaces it with the HTML code for it
     * @param {String} string The user input to replace
     * @returns {String}
     */
    removeHTML:function (string) {
        return string
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
};