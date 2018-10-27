let sHeight = screen.height;
let sWidth = screen.width;

function resizeScreen() {
    sHeight = screen.height;
    sWidth = screen.width;
}
document.addEventListener("DOMContentLoaded", () => {
    let UIInterface = document.getElementById("UIInterface");
    let lyricsText = document.getElementById("lyricsDiv");
    let songTitle = document.getElementById("songTitle");
    let cWordText = document.getElementById("currentWord");
    //let wordList = document.getElementById("wordList");
    let barElement = document.getElementById("myBar");
    let startButton = document.getElementById("startButton");
    let main = document.getElementById("main");

    let replayButton = document.getElementById("replayButton");
    let replayText = document.getElementById("replayText");

    let nextButton = document.getElementById("nextSong");
    let previousButton = document.getElementById("previousSong");

    let timer = document.getElementById("timer");

    let currentArtist = "taylor swift";
    let currentSong = "shake it off";
    let currentWord = "";
    let songQueue = new Queue();
    let replayQueue = new Queue();
    let startFlag = false;
    let pauseFlag = false
    let lyricsFlag = false;
    let fetchFlag = true;
    let songTime = Date.now();
    let elapsedTime = Date.now() - songTime;
    let songFinishTime;

    let startTime = 0;
    let endTime = 0;
    let wordTimer = 0;
    let keypressDowned = false;

    let progressBar;
    let progressBarWidth = 0;

    window.onSpotifyWebPlaybackSDKReady = () => {
        const token = 'BQB9s_-jIdaHWq96s521Yfw_94U5KzYIK-oz8JEq2phs3-b1hIBqcJwfX2ezrcY6Y4QkVpHkEPHzBbviryfd9SqJXd9QpGL4Ch56Hnmj9f_ulWb1tZbSsePYxqYXxZVuIrosQALdOXyILb7D4IcA8phdHpH0B5bQ5R0Nr0Q';
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

            if (pauseFlag){
                player.pause().then(() => {
                    console.log('Paused because repeat button was pushed and should not be automatically played');
                });
            }else{
                player.resume().then(() => {
                    console.log('play');
                });
            }

            if (fetchFlag){
                songTitle.innerHTML = (`${currentSong} by ${currentArtist}`);
                getLyrics();
                fetchFlag = false;
            }









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


        previousButton.addEventListener("click", event => {
            player.previousTrack().then(() => {
                lyricsFlag = false;
                fetchFlag = true;
                console.log('Moved to previous Track');
            });
        });


        nextButton.addEventListener("click", event => {
            player.nextTrack().then(() => {
                lyricsFlag = false;
                fetchFlag = true;
                console.log('Set to next track!');
            });
        });


        startButton.addEventListener("click", event => {

            player.resume().then(() => {
                console.log('Start playing in case song was paused! 1');
            });
            player.seek(0 * 1000).then(() => {
                console.log('Start at Song at 0 1');
            });
            startFlag = true;
            songTime = Date.now();
            let tempSong = new String(currentSong);

            //Does not work if SongList is 1 Song.
            let interval = setInterval(function () {
                if (tempSong == currentSong) {
                    elapsedTime = Date.now() - songTime;
                    timer.innerHTML = (`${(elapsedTime / 1000).toFixed(2)}s`);
                } else {
                    songFinishTime = elapsedTime;
                    console.log("setPauseFlagToTrue");
                    pauseFlag = true;
                    clearTimer(player, interval);
                }
            }, 10)

        });





        replayButton.addEventListener("click", event => {
            pauseFlag = false;
            player.previousTrack().then(() => {
                console.log('Set to previous track! 2');
            });


            player.seek(0 * 1000).then(() => {
                console.log('Start Song at 0 2');
            });
            player.resume().then(() => {
                console.log('Start playing in case song was paused! 2');
            });


            //console.log(replayQueue);
            let replayWord = replayQueue.remove();
            //console.log(replayWord);


            songTime = Date.now();
            elapsedTime = 0;
            //console.log(`songTime is ${songTime}`);
            //console.log(`songFinishTime is ${songFinishTime}`);
            //console.log(`elapsedTime is ${elapsedTime}`);




            let startHeight = UIInterface.offsetHeight;
            let curY = (sHeight - 250 - startHeight)/2;
            let interval = setInterval(function () {
                if (songFinishTime > elapsedTime) {
                    elapsedTime = Date.now() - songTime;
                    if (replayWord) {
                        if (replayWord.totalTime > elapsedTime) {
                            // Put in conditions to make word grow bigger when time is close enough

                            //console.log(`${replayWord.word} is ${elapsedTime + replayWord.time} comparedto ${replayWord.totalTime - 4000}`);
                            // If currentTime 200 + wordSingingtime 100
                            if (elapsedTime + replayWord.time > replayWord.totalTime - 4000) {

                                if (Math.random() > .5){
                                    curY -=40;
                                }else{
                                    curY += 40;
                                }


                                //Start Hieght is 388
                                // 
                                if (curY >= sHeight - 250 - startHeight) {
                                    curY -= 80;
                                }
                                else if (curY <= 0){
                                    curY += 80;
                                }
                                console.log(`${startHeight} + ${curY} => ${sHeight}`);
                                startHeight = UIInterface.offsetHeight;
                                let flashWord = document.createElement("span");
                                flashWord.classList.add("flashWord");
                                flashWord.innerHTML = replayWord.word;
                                flashWord.style.fontFamily = "Impact";
                                flashWord.style.position = "Absolute";
                                flashWord.style.top = startHeight + curY + 'px';
                                replayText.appendChild(flashWord);
                                setTimeout(function () { flashWord.parentNode.removeChild(flashWord); }, 8000);

                                //pop next word out
                                replayWord = replayQueue.remove();
                            }



                        }
                    }
                    timer.innerHTML = (elapsedTime / 1000).toFixed(2);
                } else {
                    player.pause().then(() => {
                        console.log('Stop song because repeated song was over.');
                        timer.innerHTML = "0.00s";
                        startFlag = false;
                        fetchFlag = false;
                        clearInterval(interval); //Stops interval timer from going on.
                    });
                }
            }, 10)


        });



    };









    document.addEventListener("keydown", function (event) {
        // console.log(event.which);
        if (startFlag && (event.keyCode == 74 || event.keyCode == 70)) {
            if (keypressDowned === false) {

                // Starts the interval function for time bar
                progressBar = setInterval(frame, 10);
                function frame() {
                    if (progressBarWidth > 500) {
                        barElement.style.backgroundColor = "black";
                    } else if (progressBarWidth > 400) {
                        barElement.style.backgroundColor = "purple";
                    } else if (progressBarWidth > 300) {
                        barElement.style.backgroundColor = "blue";
                    }
                    else if (progressBarWidth > 200) {
                        barElement.style.backgroundColor = "red";
                    } else if (progressBarWidth > 100) {
                        barElement.style.backgroundColor = "yellow";
                    } else {
                        barElement.style.backgroundColor = "green";
                    }
                    barElement.style.color = "#333";
                    progressBarWidth++;
                    barElement.style.width = progressBarWidth % 100 + '%';
                    barElement.innerHTML = progressBarWidth * 1;


                }

                startTime = getTime();
                //console.log(`Start time is ${startTime}`);
                keypressDowned = true;

            }
        }
    }
    );

    document.addEventListener("keyup", function (event) {
        if (startFlag && (event.keyCode == 74 || event.keyCode == 70)) {
            clearInterval(progressBar);
            barElement.style.color = "#333";
            progressBarWidth = 0;
            barElement.style.width = 0;
            barElement.innerHTML = 0;
            //console.log(event.which);
            endTime = getTime();
            //console.log(`End time is ${endTime}, start Time is ${startTime}`);
            wordTimer = endTime - startTime;
            //console.log(`Difference between time is ${wordTimer}`);
            keypressDowned = false;
            let song = {
                word: currentWord,
                time: wordTimer,
                totalTime: elapsedTime
            };
            //console.log(song);
            replayQueue.add(song);
            currentWord = songQueue.remove();
            if (currentWord) {
                cWordText.innerHTML = currentWord;
            } else {
                cWordText.innerHTML = "";
            }

            lyricsText.innerHTML = songQueue.printOutInOrder();

            // let node = document.createElement("li");    // Create a <li> node
            // node.innerHTML = `${song.word}: ${song.time}: ${song.totalTime}`;                      // Set node's text
            // wordList.insertBefore(node, wordList.firstChild);
            // if (wordList.childElementCount > 9) {
            //     wordList.removeChild(wordList.lastChild)
            // }
        }
    }
    );

    function getLyrics() {
        songQueue.removeAll();
        console.log(`Getting Song: ${currentSong} by ${currentArtist}`);
        fetch(`https://api.lyrics.ovh/v1/${currentArtist}/${currentSong}`)
            //  .json() method returns a Promise
            // of the JSON response body parsed fromJSOn.
            .then(res => res.json())
            .then(data => {
                //test.innerHTML = data.lyrics;
                if (!lyricsFlag) {
                    songQueue.addAll(lyricsSeparate(data.lyrics));
                    currentWord = songQueue.remove();
                    lyricsText.innerHTML = songQueue.printOutInOrder();
                    console.log("where it going");
                    console.log(currentWord);
                    cWordText.innerHTML = currentWord;
                    lyricsFlag = true;
                }
            })
            .catch(err => {
                console.log(err);
                cWordText.innerHTML = "";
                lyricsText.innerHTML = "Sorry, No Lyrics Found, Try Another Song :(";
            }
            );

    }


    function clearTimer(player, timer){
        clearInterval(timer); //Stops interval timer from going on.

        player.previousTrack().then(() => {
            console.log('Set to repeat track.');
        });


        player.seek(0 * 1000).then(() => {
            console.log('Start Song at time');
        });
    }

});


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

    Queue.prototype.peek = function () {
        return this.data[this.data.length - 1];
    }

    Queue.prototype.remove = function () {
        return this.data.pop();
    }

    Queue.prototype.removeAll = function () {
        this.data = [];
        return;
    }
    Queue.prototype.bottom = function () {
        return this.data[0];
    }


    Queue.prototype.size = function () {
        return this.data.length;
    }

}

