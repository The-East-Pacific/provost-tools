/**
 * Denotes the column schema of the Magister Roster spreadsheet.
 * This is used to get the column number for input info from the sheet.
 */
const ROSTER_SCHEMA = [ // Column for...
    "forum",        // Forum name
    "nation",       // TEP nation name
    "wa_nation",    // WA nation name
    "discord",      // Discord handle
    "join-date",    // Magister since
    "notes",        // Chair's discretion notes
    "ballots",      // Ballots cast [this can be multiple columns!]
    "num_votes",    // Number of ballots cast
    "status",       // Compliance status
    "reason"        // Compliance status reason
];

/**
 * Saves the column indexes for all Magister Roster properties.
 * Positive numbers denote absolute indexes (X means index X in an array representing a spreadsheet row).
 * Negative numbers denote relative indexes (-X means subtract X from the length of an array representing a row for the correct index).
 */
const COLUMNS = {
    votes_start: ROSTER_SCHEMA.indexOf('ballots')
}
for (let col of ROSTER_SCHEMA) { // Figure out the indexes for the spreadsheet columns
    if (col === 'ballots') continue;
    else if (ROSTER_SCHEMA.indexOf(col) < COLUMNS.votes_start) COLUMNS[col] = ROSTER_SCHEMA.indexOf(col);
    else COLUMNS[col] = -1 * (ROSTER_SCHEMA.length - ROSTER_SCHEMA.indexOf(col));
}

/**
 * How many header rows there are on the Legislator Roster spreadsheet.
 */
const NUM_HEADERS = 3;

/**
 * Shortcut for `document.getElementById(elementID)`.
 * @param {string} elementID ID of the element to get
 * @returns {HTMLElement} The `HTMLElement` with the given ID
 */
function id(elementID) {
    return document.getElementById(elementID);
}

/**
 * 
 * @param {string} col 
 * @param {string} rowEx 
 * @returns 
 */
function getIndex(col, rowEx) {
    return COLUMNS[col] < 0 ? rowEx.split('\t').length + COLUMNS[col] : COLUMNS[col];
}

/**
 * Capitalizes the first letter of the given string.
 * @param {string} str String to capitalize the first letter of
 * @returns The given string with its first letter capitalized
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 
 * @param {object} arrayObject Object containing arrays
 * @returns A Discourse-compatible Markdown Table
 */
function generateMarkdownTable(arrayObject) {
    const arrays = Object.values(arrayObject);
    const maxLength = Math.max(...arrays.map(arr => arr.length));
  
    let table = '';
  
    // Add headers
    for (const key in arrayObject) {
      if (arrayObject.hasOwnProperty(key)) {
        table += `| ${capitalizeFirst(key)} `;
      }
    }
    table += '|\n';
  
    // Add column separator
    for (const key in arrayObject) {
      if (arrayObject.hasOwnProperty(key)) {
        table += '| --- ';
      }
    }
    table += '|\n';
  
    // Add rows
    for (let row = 0; row < maxLength; row++) {
      for (const key in arrayObject) {
        if (arrayObject.hasOwnProperty(key)) {
          const value = arrayObject[key][row] !== undefined ? arrayObject[key][row] : '';
          table += `| ${value} `;
        }
      }
      table += '|\n';
    }
  
    return table;
  }


const MOTION_TYPES = {
    general: { debate: 3, passage: 0.5 },
    constitutional: { debate: 5, passage: 0.6 },
    treaty: { debate: 5, passage: 0.5 },
    appointment: { debate: 3, passage: 0.5 },
    appointment_crs: { debate: 3, passage: 0.6 },
    recall: { debate: 3, passage: 0.6 }
}