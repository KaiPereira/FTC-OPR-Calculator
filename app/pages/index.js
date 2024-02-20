'use client'

import axios from "axios"
import { useEffect, useState } from "react"

const Home = () => {
    const [data, setData] = useState("")
    const [sorting, setSorting] = useState("opr")


    const getData = async () => {
        let oprData = await axios.get("/api/rankings");
        oprData = oprData.data.message

        oprData.sort((a, b) => {
            switch(sorting) {
                case "opr":
                    if ( a.opr > b.opr ){
                        return -1;
                    }
                    return 1
                case "ccwm":
                    if ( a.ccwm > b.ccwm ){
                        return -1;
                    }
                    return 1
                case "auto":
                    if ( a.auto > b.auto ){
                        return -1;
                    }
                    return 1
                case "endgame":
                    if ( a.endgame > b.endgame ){
                        return -1;
                    }
                    return 1
            }
        })

        // console.log(oprData)

        setData(oprData)
    }

    useEffect(() => {
        getData()
    }, [sorting])


    console.log(data)
    return (
    <>
        { data &&
            <div className="ranking-align">
                <div className="ranking-grid">
                    <div className="ranking-buttons">
                        <button onClick={() => setSorting("opr")}>OPR</button>
                        <button onClick={() => setSorting("ccwm")}>CCWM</button>
                        <button onClick={() => setSorting("auto")}>AUTO</button>
                        <button onClick={() => setSorting("endgame")}>ENDGAME</button>
                    </div>
                    {
                        data.map((team, index) => {
                            return (
                                <div className="ranking-row" key={index}>
                                    <p><b>NUMBER:</b> {Math.round(team.team)}</p>
                                    <p><b>TEAM NAME: </b>{team.team_name}</p>
                                    <p><b>OPR:</b> {Math.round(team.opr)}</p>
                                    <p><b>CCWM:</b> {Math.round(team.ccwm)}</p>
                                    <p><b>AUTO:</b> {Math.round(team.auto)}</p>
                                    <p><b>ENDGAME:</b> {Math.round(team.endgame)}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        }
    </>
    )
}

export default Home