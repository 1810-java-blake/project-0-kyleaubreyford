document.addEventListener("DOMContentLoaded", () => {
    let test = document.getElementById("lyricsDiv");
    let testButton = document.getElementById("lyricsButton");
    let cWordText = document.getElementById("currentWord");
    let wordList = document.getElementById("wordList");

    let songButton = document.getElementById("songButton");
    let startSong = document.getElementById("startSong");

    let replayButton = document.getElementById("replayButton");
    let replayText = document.getElementById("replayText");

    let timer = document.getElementById("timer");

    let currentArtist = "taylor swift";
    let currentSong = "shake it off";
    let currentWord = "";
    let songQueue = new Queue();
    let replayQueue = new Queue();
    let songFI = false;
    let songTime = Date.now();
    let elapsedTime = Date.now() - songTime;
    let songFinishTime;


    window.onSpotifyWebPlaybackSDKReady = () => {
        const token = 'BQDpFXxG_wyQX3CVKSFjO694DhB4XEOVhYu-SRsqMDph_GM1lR2r4AAZn69nx6t4XVYm-4BSQfMfAGCwCQ8wVdU4YsgGsEhKjbYPmXdq0hVj0kufAJ5xZOP2FASYiWGXuXBrE1nkQqYSiY1qt7DwmwsXBaKfi_Uer1Xxg3w';
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



        songButton.addEventListener("click", event => {
            player.togglePlay().then(() => {
                console.log('Toggled playback! 1');
            });
        });

        startSong.addEventListener("click", event => {

            player.resume().then(() => {
                console.log('Start playing in case song was paused! 1');
            });
            player.seek(140 * 1000).then(() => {
                console.log('Start at Song at 0 1');
            });
            songTime = Date.now();
            let tempSong = new String(currentSong);
            let interval = setInterval(function () {
                if (tempSong == currentSong) {
                    elapsedTime = Date.now() - songTime;
                    timer.innerHTML = (elapsedTime / 1000).toFixed(2);
                } else {
                    player.pause().then(() => {
                        console.log('Stop song because main song was over 1.');
                    });
                    songFinishTime = elapsedTime;
                    clearInterval(interval); //Stops interval timer from going on.
                }
            }, 10)

        });


        replayButton.addEventListener("click", event => {

            player.previousTrack().then(() => {
                console.log('Set to previous track! 2');
            });


            player.seek(0 * 1000).then(() => {
                console.log('Start Song at 0 2');
            });
            player.resume().then(() => {
                console.log('Start playing in case song was paused! 2');
            });


            console.log(replayQueue);
            let replayWord = replayQueue.remove();
            console.log(replayWord);
            replayText.innerHTML = replayWord.word;


            songTime = Date.now();
            elapsedTime = 0;
            console.log(`songTime is ${songTime}`);
            console.log(`songFinishTime is ${songFinishTime}`);
            console.log(`elapsedTime is ${elapsedTime}`);
            let tempSong = new String(currentSong);

            let interval = setInterval(function () {
                if (songFinishTime > elapsedTime) {
                    elapsedTime = Date.now() - songTime;
                    if (replayWord.totalTime > elapsedTime) {
                        // Put in conditions to make word grow bigger when time is close enough
                        console.log(`elapsedTime is ${elapsedTime}`);

                        if (elapsedTime + replayWord.time > replayWord.totalTime) {
                            replayText.style.color = "blue";

                            //Word should be highlighted
                        } else {
                            replayText.style.color = "red";
                            //Countdown to word should be spoken?

                        }
                    } else {
                        //Put in code to move on to next word.
                        replayWord = replayQueue.remove();
                        replayText.innerHTML = replayWord.word;

                    }
                    timer.innerHTML = (elapsedTime / 1000).toFixed(2);
                } else {
                    player.pause().then(() => {
                        console.log('Stop song because main song was over.');
                        clearInterval(interval); //Stops interval timer from going on.
                    });
                }
            }, 10)


        });



    };







    testButton.addEventListener("click", event => {
        fetch(`https://api.lyrics.ovh/v1/${currentArtist}/${currentSong}`)
            //  .json() method returns a Promise
            // of the JSON response body parsed fromJSOn.
            .then(res => res.json())
            .then(data => {
                //test.innerHTML = data.lyrics;
                if (!songFI) {
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
                //console.log(`Start time is ${startTime}`);
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
                word: currentWord,
                time: wordTimer,
                totalTime: elapsedTime
            };
            replayQueue.add(song);
            currentWord = songQueue.remove();
            cWordText.innerHTML = currentWord;
            test.innerHTML = songQueue.printOutInOrder();

            let node = document.createElement("li");    // Create a <li> node
            node.innerHTML = `${song.word}: ${song.time}: ${song.totalTime}`;                      // Set node's text
            wordList.insertBefore(node, wordList.firstChild);
            if (wordList.childElementCount > 9) {
                wordList.removeChild(wordList.lastChild)
            }
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
    return tempString.filter(v => v != '');
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