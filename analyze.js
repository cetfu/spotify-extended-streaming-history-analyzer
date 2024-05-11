(async () => {
    const fs = require("node:fs/promises")
    const total = {
        "2021-2022": {},
        "2022-2023": {},
        "2023-2024": {},
        "2024-2025": {},
    }
    const files = await fs.readdir(__dirname + "/data")

    for (const file of files) {
        let year

        if (file === "Streaming_History_Audio_2021-2022_0.json") {
            year = "2021-2022"
        } else if (file === "Streaming_History_Audio_2022-2023_1.json") {
            year = "2022-2023"
        } else if (file === "Streaming_History_Audio_2023-2024_2.json") {
            year = "2023-2024"
        } else if (file === "Streaming_History_Audio_2024_3.json") {
            year = "2024-2025"
        }

        const content = (await fs.readFile(__dirname + "/data/" + file)).toString()
        const json = JSON.parse(content)


        for (const data of json) {
            const {
                master_metadata_track_name: track_name,
                master_metadata_album_artist_name: artist_name,
                spotify_track_uri: track_uri,
                ms_played: playtime
            } = data
            if (typeof total[year][track_uri] === "undefined") {
                total[year][track_uri] = {
                    play_count: 1,
                    track_name,
                    artist_name,
                    playtime
                }
            } else {
                const oldTrack = total[year][track_uri]
                total[year][track_uri] = {
                    play_count: oldTrack.play_count + 1,
                    playtime: oldTrack.playtime + playtime,
                    track_name, artist_name
                }
            }
        }

    }

    const response = []

    const years = Object.keys(total)
    for (const year of years) {
        const inYear = total[year] // mevcut yıl içinde çalınan şarkılar
        const trackInYear = Object.keys(inYear) // şarkıların keyleri işte

        for (const track of trackInYear) {
            const {play_count, track_name, artist_name, playtime} = inYear[track]
            response.push({
                play_count,
                track_name,
                artist_name,
                playtime_ms: playtime,
                playtime: millisToMinutesAndSeconds(playtime) + " minutes",
                year: parseFloat(year.replace("-","."))
            })

        }

    }

    response.sort((a, b) => b.playtime_ms - a.playtime_ms)
    response.sort((a, b) => b.year - a.year)
    await fs.writeFile(__dirname + "/export.json",JSON.stringify(response, null, 2), "utf8")


    function millisToMinutesAndSeconds(millis) {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

})()
