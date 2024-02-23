import axios from "axios"
import jsdom from "jsdom"
import { matrix, pinv, multiply, inv, transpose, column } from "mathjs"



// def convertToList(statMatrix):
//     l = []
//     for val in statMatrix:
//         l.append(round(float(val), 3))
//     return l

const convertToList = (matrix) => {
    let list = [];
    for (let i = 0; i < matrix.length; i++) {
        length.push(matrix[i])
    }
    return list
}


export default async function handler(req, res) {
    // Fetch the data from google sheets (too lazy for the api)
    let data = await axios.get("https://docs.google.com/spreadsheets/d/1SYbYtACpzXYUtVPeo36ZUtsVLNMCsckd0mSYTLYfhzE/edit?usp=sharing");


    // Convert data into HTML
    const { JSDOM } = jsdom;

    const html = new JSDOM(data.data)

    const document = html.window.document;

    // New
    // columns[0] = red alliance 1
    // columns[1] = red alliance 2
    // columns[2] = red score
    // columns[3] = red auto
    // columns[4] = red endgame
    // columns[5] = blue alliance 1
    // columns[6] = blue alliance 2
    // columns[7] = blue score
    // columns[8] = blue auto
    // columns[9] = blue endgame
    // columns[10] = Team number
    // columns[11] = Team name



    // These are the rows for team numbers and names
    let all_rows_arrays = []

    // For all our rows to go into
    let rows_array = []


    // Grab the first TBody and all the TR in it
    let row_parent = document.getElementsByTagName("tbody")[0];
    let rows = row_parent.getElementsByTagName("tr");

    // Get a list of all of the rows
    // BTW, we set i to 1 so we don't get the labels row
    for (let i = 1; i < rows.length; i++) {
        if (rows[i].style.height = "20px") {
            // Get all columns in the row
            let columns = rows[i].getElementsByTagName("td");

            // If it's a row with no columns with stuff in the them don't use em
            // OR if it's the index 0 label row
            if (columns[0].textContent) {
                // For all our columns to go into
                let all_columns = [];
                let all_columns_2 = [];


                for (let z = 0; z < columns.length; z++) {
                    if (columns[z].textContent) {
                        // console.log(columns[z].textContent)
                        all_columns.push(columns[z].textContent)
                    }
                }

                // Push it into our rows array/obj
                rows_array.push(
                    {
                        index: i,
                        columns: all_columns
                    }
                )


                for (let z = 10; z < columns.length; z++) {
                    if (columns[z].textContent) {
                        // console.log(columns[z].textContent)
                        all_columns_2.push(columns[z].textContent)
                    }
                }

                if (columns[10].textContent) {
                    all_rows_arrays.push(
                        {
                            index: i,
                            columns: all_columns_2
                        }
                    )
                }
            } else if (columns[10].textContent) {
                // For all our columns to go into
                let all_columns = [];


                for (let z = 10; z < columns.length; z++) {
                    if (columns[z].textContent) {
                        // console.log(columns[z].textContent)
                        all_columns.push(columns[z].textContent)
                    }
                }

                all_rows_arrays.push(
                    {
                        index: i,
                        columns: all_columns
                    }
                )
            }
        }
    }


    // Put all the scores, margins and autos in a array
    let scores = [];
    let autos = [];
    let margins = [];
    let endgames = [];
    let team_details = [];

    for (let i = 0; i < rows_array.length; i++) {
        // All these go red then blue scores
        // Push all scores
        scores.push(rows_array[i].columns[2])
        scores.push(rows_array[i].columns[7])
        // Push all auto's
        autos.push(rows_array[i].columns[3])
        autos.push(rows_array[i].columns[8])
        // Push all margins
        margins.push(rows_array[i].columns[2] - rows_array[i].columns[7])
        margins.push(rows_array[i].columns[7] - rows_array[i].columns[2])
        // Push all endgames
        endgames.push(rows_array[i].columns[4])
        endgames.push(rows_array[i].columns[9])
    }


    for (let i = 0; i < all_rows_arrays.length; i++) {
        // Push all team details
        team_details.push({
            team_number: all_rows_arrays[i].columns[0],
            team_name: all_rows_arrays[i].columns[1],
        })
    }

    console.log(team_details)




    let teams = [];

    // Put all the teams in an array
    for (let i = 0; i < rows_array.length; i++) {
        teams.push(rows_array[i].columns[0])
        teams.push(rows_array[i].columns[1])
        teams.push(rows_array[i].columns[5])
        teams.push(rows_array[i].columns[6])
    }

    // Remove duplicate teams
    teams = [...new Set(teams)]




    let matches = [];

    for (let i = 0; i < rows_array.length; i++) {
        // For red
        let red = [];
        for (let z = 0; z < teams.length; z++) {
            if ((rows_array[i].columns[0] == teams[z]) || (rows_array[i].columns[1] == teams[z])) {
                red.push(1)
            } else {
                red.push(0)
            }
        }    
        matches.push(red)


        // For blue
        let blue = [];
        for (let z = 0; z < teams.length; z++) {
            if ((rows_array[i].columns[5] == teams[z]) || (rows_array[i].columns[6] == teams[z])) {
                blue.push(1)
            } else {
                blue.push(0)
            }
        }

        matches.push(blue)
    }


    // Convert everything to a matrix
    matches = matrix(matches);
    scores = matrix(scores)
    autos = matrix(autos)
    margins = matrix(margins)
    endgames = matrix(endgames)
    // console.log(matches)



    // // Find the pseudoinverse of the matrix M. Multiplying this by a results matrix will find the
    // // solution to the overdetermined system of equations.
    // // Guys, I don't know what this means lol - Kai
    // Calculate the pseudoinverse using js
    // Sometimes switching between these will fix the determinant is zero error lol
    let pseudoinverse;
    try {
        pseudoinverse = multiply(transpose(matches), inv(multiply(matches, transpose(matches))))
    } catch {
        pseudoinverse = matrix(pinv(matches));
    }
    
    let oprs = multiply(pseudoinverse, scores)
    let auto_performances = multiply(pseudoinverse, autos)
    let ccwms = multiply(pseudoinverse, margins)
    let endgame_performances = multiply(pseudoinverse, endgames)


    // Convert the matrixs back after running calculations on them
    oprs = oprs._data
    auto_performances = auto_performances._data
    ccwms = ccwms._data
    endgame_performances = endgame_performances._data

    let sorted_teams = [];
    let sorted_oprs = [];
    let sorted_autos = [];
    let sorted_ccwms = [];
    let sorted_endgames = [];

    while (sorted_teams.length < teams.length) {
        var best_team = ""
        var best_opr = ""
        var best_auto = ""
        var best_ccwm = ""
        var best_endgame = ""

        for (let i = 0; i < teams.length; i++) {
            if (!sorted_teams.includes(teams[i])) {
                best_team = teams[i]
                best_opr = oprs[i]
                best_auto = auto_performances[i]
                best_ccwm = ccwms[i]
                best_endgame = endgame_performances[i]

                break;
            }
        }

        for (let i = 0; i < teams.length; i++) {
            if (oprs[i] > best_opr && !sorted_teams.includes(teams[i])) {
                best_team = teams[i]
                best_opr = oprs[i]
                best_auto = auto_performances[i]
                best_ccwm = ccwms[i]
                best_endgame = endgame_performances[i]
            }
        }

        sorted_teams.push(best_team);
        sorted_autos.push(best_auto)
        sorted_ccwms.push(best_ccwm)
        sorted_oprs.push(best_opr)
        sorted_endgames.push(best_endgame)
    }



    let final_scores = [];

    for (let i = 0; i < teams.length; i++) {
        const team_num = sorted_teams[i];

        let team_name = team_details[team_details.map(e => e.team_number).indexOf(sorted_teams[i])];
        
        if (!team_name) team_name = "Not Known"
        else team_name = team_name.team_name

        final_scores.push(
            {
                team: team_num,
                opr: sorted_oprs[i],
                auto: sorted_autos[i],
                ccwm: sorted_ccwms[i],
                endgame: sorted_endgames[i],
                team_name: team_name
            }
        )

        // console.log(`Team: ${team_num}, OPR: ${sorted_oprs[i]}, AUTO: ${sorted_autos[i]}, CCWM: ${sorted_ccwms[i]}, ENDGAME: ${sorted_endgames[i]}`)
    }


    res.status(200).json({ message: final_scores })
    // res.status(200).json({ message: "HELLO WORLD!" })
}