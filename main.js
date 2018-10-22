document.addEventListener("DOMContentLoaded", () => {
    let test = document.getElementById("lyricsDiv");
    let testButton = document.getElementById("lyricsButton");
    let cWordText = document.getElementById("currentWord");
    let wordList = document.getElementById("wordList");

    let currentArtist = "taylor swift";
    let currentSong = "shake it off";
    let currentWord = "";
    let songQueue = new Queue();
    let replayQueue = new Queue();
    let songFI = false;


    window.onSpotifyWebPlaybackSDKReady = () => {
        const token = 'BQBnTLx94OG2fVeEqhkwr4gh0G4Py3Rxxx7gz7RkTm5sjCe53nvIZS9meinviOBUPFAbbBb2Z3uw-tPwT3c75lUtUKvy6jxQOgAUbOei8bk4DUvSHf6xLUuftVP0zw9RokDoQJJKDbComvPUQ4T8XHwYTxEkRekZTwM169U';
        const player = new Spotify.Player({
            name: 'Web Playback SDK Quick Start Player',
            getOAuthToken: cb => { cb(token); }
        });
    
        // Error handling
        player.addListener('initialization_error', ({ message }) => { console.error(message); });
        player.addListener('authentication_error', ({ message }) => { console.error(message); });
        player.addListener('account_error', ({ message }) => { console.error(message); });
        player.addListener('playback_error', ({ message }) => { console.error(message); });
    
        // Playback status updates
        player.addListener('player_state_changed', state => {
            console.log(state);
            currentSong = state.track_window.current_track.name;
            currentArtist = state.track_window.current_track.artists[0].name;
            console.log(currentArtist);
            console.log(currentSong);
        });
    
        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
        });
    
        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });
    
        // Connect to the player!
        player.connect();
    
    
    
        let songButton = document.getElementById("songButton");
        songButton.addEventListener("click", event => {
            player.togglePlay().then(() => {
                console.log('Toggled playback!');
            });
        });
    
    };
    






    testButton.addEventListener("click", event => {
        fetch(`https://api.lyrics.ovh/v1/${currentArtist}/${currentSong}`)
            //  .json() method returns a Promise
            // of the JSON response body parsed fromJSOn.
            .then(res => res.json())
            .then(data => {
                //test.innerHTML = data.lyrics;
                if (!songFI){
                songQueue.addAll(lyricsSeparate(data.lyrics));
                console.log(songQueue);
                currentWord = songQueue.remove();
                test.innerHTML = songQueue.printOutInOrder();
                
                console.log(currentWord);
                cWordText.innerHTML = currentWord;
                songFI = true;
                }
            })
            .catch(err => console.log(err));
    });

    let startTime = 0;
    let endTime = 0;
    let wordTimer = 0;
    let keypressDowned = false;
    document.addEventListener("keydown", function (event) {
        // console.log(event.which);

        if (songFI) {
            if (keypressDowned === false) {

                startTime = getTime();
                console.log(`Start time is ${startTime}`);
                keypressDowned = true;

            }
        }
    }
    );

    document.addEventListener("keyup", function (event) {

        if (songFI) {

            //console.log(event.which);
            endTime = getTime();
            //console.log(`End time is ${endTime}`);
            wordTimer = Date.daysBetween(startTime, endTime);
            //console.log(`Difference between time is ${wordTimer}`);
            keypressDowned = false;
            let song = {
                word:currentWord, 
                time:wordTimer
            };
            replayQueue.add(song);
            currentWord = songQueue.remove();
            cWordText.innerHTML = currentWord;
            test.innerHTML = songQueue.printOutInOrder();

            let node = document.createElement("li");    // Create a <li> node
                node.innerHTML = `${song.word}: ${song.time}`;                      // Set node's text
                wordList.appendChild(node)  
        }
    }
    );

});


Date.daysBetween = function (date1, date2) {
    //Get 1 day in milliseconds
    var one_day = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;

    // Convert back to days and return
    return difference_ms;
}



function getTime() {
    var now = new Date();
    return now;
}


function nextWord() {

}


function lyricsSeparate(lyrics) {
    // Replaces out parenthesis.
    let tempString = lyrics.replace(/ *\([^)]*\) */g, "");
    // Replaces newlines with space and splits it by space.
    tempString = tempString.replace(/\n/g, " ").split(" ");
    // Filters out empty strings and returns final array.
    return tempString.filter(v=>v!='');
}
function Queue() {
    this.data = [];

    Queue.prototype.add = function (object) {
        this.data.unshift(object);
    }

    Queue.prototype.addAll = function (arraySongs) {
        arraySongs.forEach(x => this.data.unshift(x));
    }

    Queue.prototype.printOutInOrder = function () {
        let tempQ = this.data;
        tempQ = tempQ.slice().reverse();
        return tempQ.join(' ')

    }

    Queue.prototype.remove = function () {
        return this.data.pop();
    }

    Queue.prototype.first = function () {
        return this.data[0];
    }

    Queue.prototype.last = function () {
        return this.data[this.data.length - 1];
    }

    Queue.prototype.size = function () {
        return this.data.length;
    }

}