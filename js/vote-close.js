/* 
 *
 */

/**
 * @type CanvasRenderingContext2D
 */
const CTX = document.getElementById('result-img').getContext('2d');

function generate() {
    // Count the votes
    let ballots = {};
    let voteTables = {
        "aye": [],
        "nay": [],
        "abstain": [],
        "absent": []
    }
    let tally = {
        aye: 0,
        nay: 0,
        abstain: 0,
        excused: 0
    }

    for(let ballot in tally) {
        let votes = 0;
        for(let magister of id('v' + ballot).value.split(', ')) {
            if(magister.length == 0) continue;
            ballots[magister] = ballot;
            votes++;
        }
        tally[ballot] = votes;
    }

    // Count the number of magisters and create the pasteable vote list for the spreadsheet
    let roster = id('roster').value.split('\n');
    let numMags = 0;
    let pasteVotesList = '';
    let nameIndex = getIndex('forum', roster[NUM_HEADERS]);
    let notesIndex = getIndex('notes', roster[NUM_HEADERS])
    for(let row of roster) {
        if(roster.indexOf(row) < NUM_HEADERS) continue;
        pasteVotesList += '\n';
        let cells = row.split('\t');
        if(cells[notesIndex].includes("Suspended")) continue;
        pasteVotesList += ballots[cells[nameIndex]] === undefined ? '' : capitalizeFirst(ballots[cells[nameIndex]]);
        if(ballots[cells[nameIndex]] == "excused") continue;
        ballots[cells[nameIndex]] === undefined ? voteTables.absent.push(cells[nameIndex]) : voteTables[ballots[cells[nameIndex]]].push(cells[nameIndex]);
        numMags++;
    }

    let billTitle = id('btitle').value;
    let billCode = id('bcode').value;
    let threshold = parseFloat(id('threshold').value * .01);
    tally.absent = numMags - tally.aye - tally.nay - tally.abstain;
    console.log(tally);

    createVisual(billCode, threshold, tally);
    id('table-out').value = generateMarkdownTable(voteTables);
    id('paste-votes').value = pasteVotesList.replace('\n', '');
    id('bbcode-out').value = `**[color=#109aed]${billCode}[/color] [color=#ff9900]|[/color]** ${billTitle} <span style="border-radius: 3px; padding: 2px 4px; margin-left: 2px; font-weight: bold; border: 1.5px` + (tally.aye >= (tally.aye + tally.nay) * threshold ? 'solid green; color: green">Passed' : 'solid red; color: red">Failed') + `</span>

    <hr>
    
    [center][size=200]**[color=#109aed]Final Result[/color]**[/size][/center]
    
    [center]
    INSERT IMAGE HERE
    [/center]
    
    <hr>
    
    This **BILLTYPE** required a ${threshold * 100}% majority of votes in favour, excluding abstentions, to pass. 
    
    The results are tabled as follows:
    ${generateMarkdownTable(voteTables)}
    
    | Type | Tally | Percentage of Vote | Final Percentage |
    | --- | --- | --- | --- |
    | **[color=#4572a7]Ayes[/color]** |${tally.aye} | ${(100.0 * tally.aye / (tally.aye + tally.nay)).toFixed(1)}% | **${(100.0 * tally.aye / (numMags - tally.absent)).toFixed(1)}%**
    | **[color=#aa4643]Nays[/color]** | ${tally.nay} | ${(100.0 * tally.nay / (tally.aye + tally.nay)).toFixed(1)}% | **${(100.0 * tally.nay / (numMags - tally.absent)).toFixed(1)}%** |
    | **[color=#ff9900]Abstentions[/color]** | ${tally.abstain} | ${(100.0 * tally.abstain / (numMags - tally.absent)).toFixed(1)}% |
    |
    |
    | **[color=#109aed]Total[/color]** | ${numMags - tally.absent} | ${(100.0 * (numMags - tally.absent) / numMags).toFixed(1)}% of Magisters |
    | **[color=#989898]Absent[/color]** | ${tally.absent} | ${(100.0 * tally.absent / numMags).toFixed(1)}% of Magisters |
    
    Pursuant to the Concordat and the Standing Orders, the Magisterium has voted to **[color=` + (tally.aye >= (tally.aye + tally.nay) * threshold ? 'green]approve' : 'red]reject') + `[/color]** this Repeal.
    
    It will now be sent to the Delegate/Conclave for signature/referendum.
    [details=Screenshot]
    SCREENSHOT OF POLL GOES HERE
    [/details]`;
}

// Paint a visual representation of the voting results.
function createVisual(voteID, threshold, tally) {
    
    CTX.beginPath();
    CTX.clearRect(0, 0, CTX.width, CTX.height);
    CTX.closePath();

    // Draw the static background image.
    CTX.drawImage(document.getElementById('bg'), 0, 0);

    // Draw the diagrams
    let toThreshold = 258.0 * threshold;
    CTX.moveTo(51 + toThreshold, 256);
    CTX.lineTo(51 + toThreshold, 264);
    CTX.stroke();
    CTX.moveTo(51 + toThreshold, 284);
    CTX.lineTo(51 + toThreshold, 292);
    CTX.stroke();

    paintArch(tally);
    paintBar(tally);


    // Add a title either saying [voteID] PASSED/FAILED
    CTX.font = 'bold 36px Semplicita';
    CTX.textAlign = 'center';
    CTX.fillText(voteID + (tally.aye / (tally.aye + tally.nay) > threshold ? ' PASSED' : ' FAILED'), 180, 41);

    let img = document.createElement('img');
    img.setAttribute('src', document.getElementById('result-img').toDataURL('image/png'));
    document.getElementById('img-gen').appendChild(img);
}

// Paint an arch diagram depicting the vote tally and an
// indicator of how many votes were cast onto the canvas.
function paintArch(tally) {
    
    // Use the tweaked parliament diagram creator to draw an arch
    // diagram of magisters with their stances
    drawMagisters(`Aye, ${tally.aye}, #4572A7, 0.2, #FFFFFF; `
            + `Nay, ${tally.nay}, #AA4643, 0.2, #FFFFFF; `
            + `Abstain, ${tally.abstain}, #FF9900, 0.2, #FFFFFF; `
            + `Absent, ${tally.absent}, #989898, 0.2, #FFFFFF`);

    // Paint number of magisters
    CTX.textAlign = 'center';
    CTX.fillStyle = 'white';
    CTX.font = 'bold 36px Semplicita';
    CTX.fillText((tally.aye + tally.nay + tally.abstain + tally.absent).toString(), 180, 220);
    CTX.font = '14px Semplicita';
    CTX.fillText(`${tally.aye + tally.nay + tally.abstain} PRESENT`, 180, 240);
}

// Paint a bar pitching solely aye and nay votes against
// each other below the arch diagram.
function paintBar(tally) {

    // Calculate up to which pixel the aye bar will go
    let toPx = Math.round(258.0 * tally.aye / (tally.aye + tally.nay));

    // Paint the aye bar
    CTX.fillStyle = '#4572A7';
    CTX.fillRect(51, 265, toPx, 18);

    // Paint the percentage
    CTX.font = '16px Semplicita';
    CTX.fillStyle = 'white';
    CTX.textAlign = 'right';
    CTX.fillText(`${tally.aye}`, 40, 280);
    if(tally.aye > tally.nay) {
        CTX.fillText(`${(100.0 * tally.aye / (tally.aye + tally.nay)).toFixed(1)}%`, toPx + 45, 280);
        CTX.textAlign = 'left';
    } else {
        CTX.textAlign = 'left';
        CTX.fillText(`${(100.0 * tally.nay / (tally.aye + tally.nay)).toFixed(1)}%`, toPx + 55, 280);
    }
    CTX.fillText(`${tally.nay}`, 320, 280);
}

const template = `**[color=#109aed]${billCode}[/color] [color=#ff9900]|[/color]** ${billTitle} <span style="border-radius: 3px; padding: 2px 4px; margin-left: 2px; font-weight: bold; border: 1.5px` + (tally.aye >= (tally.aye + tally.nay) * threshold ? 'solid green; color: green">Passed' : 'solid red; color: red">Failed') + `</span>

<hr>

[center][size=200]**[color=#109aed]Final Result[/color]**[/size][/center]

[center]
INSERT IMAGE HERE
[/center]

<hr>

This **BILLTYPE** required a ${threshold * 100}% majority of votes in favour, excluding abstentions, to pass. 

The results are tabled as follows:
${generateMarkdownTable(voteTables)}

| Type | Tally | Percentage of Vote | Final Percentage |
| --- | --- | --- | --- |
| **[color=#4572a7]Ayes[/color]** |${tally.aye} | ${(100.0 * tally.aye / (tally.aye + tally.nay)).toFixed(1)}% | **${(100.0 * tally.aye / (numMags - tally.absent)).toFixed(1)}%**
| **[color=#aa4643]Nays[/color]** | ${tally.nay} | ${(100.0 * tally.nay / (tally.aye + tally.nay)).toFixed(1)}% | **${(100.0 * tally.nay / (numMags - tally.absent)).toFixed(1)}%** |
| **[color=#ff9900]Abstentions[/color]** | ${tally.abstain} | ${(100.0 * tally.abstain / (numMags - tally.absent)).toFixed(1)}% |
|
|
| **[color=#109aed]Total[/color]** | ${numMags - tally.absent} | ${(100.0 * (numMags - tally.absent) / numMags).toFixed(1)}% of Magisters |
| **[color=#989898]Absent[/color]** | ${tally.absent} | ${(100.0 * tally.absent / numMags).toFixed(1)}% of Magisters |

Pursuant to the Concordat and the Standing Orders, the Magisterium has voted to **[color=` + (tally.aye >= (tally.aye + tally.nay) * threshold ? 'green]approve' : 'red]reject') + `[/color]** this Repeal.

It will now be sent to the Delegate/Conclave for signature/referendum.
[details=Screenshot]
SCREENSHOT OF POLL GOES HERE
[/details]`