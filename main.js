let sHeight = screen.height;
let sWidth = screen.width;

function resizeScreen() {
    sHeight = screen.height;
    sWidth = screen.width;
}
document.addEventListener("DOMContentLoaded", () => {
    let test = document.getElementById("lyricsDiv");
    let songTitle = document.getElementById("songTitle");
    let cWordText = document.getElementById("currentWord");
    let wordList = document.getElementById("wordList");
    let elem = document.getElementById("myBar");
    let startSong = document.getElementById("startSong");
    let main = document.getElementById("main");

    let replayButton = document.getElementById("replayButton");
    let replayText = document.getElementById("replayText");

    let nextSong = document.getElementById("nextSong");
    let previousSong = document.getElementById("previousSong");

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

    let startTime = 0;
    let endTime = 0;
    let wordTimer = 0;
    let keypressDowned = false;

    let progressBar;
    let progressBarWidth = 0;

    window.onSpotifyWebPlaybackSDKReady = () => {
        const token = 'BQAHz8IQt3CF3pcntG5XTnRwlUp5Gj4QhiYFJUptmd6x8AaDIYO9CJmA1iA7C4Gu6EXI_m7WCRyeQyIgBJzKBOG6ejyCeeTZS9bZ8o1G7FQAd3WaQVHRvyT_LmO1DYUTNFldOUQzy-tb3WV24TQPF0di0bsGMYBo51zfhxI';
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
            if (currentSong) {

                songTitle.innerHTML = (`${currentSong} by ${currentArtist}`);

                fetch(`https://api.lyrics.ovh/v1/${currentArtist}/${currentSong}`)
                    //  .json() method returns a Promise
                    // of the JSON response body parsed fromJSOn.
                    .then(res => res.json())
                    .then(data => {
                        //test.innerHTML = data.lyrics;
                        if (!songFI) {
                            songQueue.addAll(lyricsSeparate(data.lyrics));
                            currentWord = songQueue.remove();
                            test.innerHTML = songQueue.printOutInOrder();

                            //console.log(currentWord);
                            cWordText.innerHTML = currentWord;
                            songFI = true;
                        }
                    })
                    .catch(err => console.log(err));


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


        previousSong.addEventListener("click", event => {
            player.previousTrack().then(() => {
                console.log('Moved to previous Track');
            });
        });


        nextSong.addEventListener("click", event => {
            player.nextTrack().then(() => {
                console.log('Set to next track!');
            });
        });


        startSong.addEventListener("click", event => {

            player.resume().then(() => {
                console.log('Start playing in case song was paused! 1');
            });
            player.seek(180 * 1000).then(() => {
                console.log('Start at Song at 0 1');
            });
            songTime = Date.now();
            let tempSong = new String(currentSong);

            //Does not work if SongList is 1 Song.
            let interval = setInterval(function () {
                if (tempSong == currentSong) {
                    elapsedTime = Date.now() - songTime;
                    timer.innerHTML = (`${(elapsedTime / 1000).toFixed(2)}s`);
                } else {
                    player.pause().then(() => {
                        console.log('Stop song because main song was over 1.');
                    });
                    console.log("hi");
                    songFinishTime = elapsedTime;
                    clearInterval(interval); //Stops interval timer from going on.
                }
            }, 10)

        });





        replayButton.addEventListener("click", event => {

            player.previousTrack().then(() => {
                console.log('Set to previous track! 2');
            });


            player.seek(180 * 1000).then(() => {
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
            const rows = 3;
            const columns = 10;
            let yUnit = 100;
            let xUnit = 400;
            let curY = 0;
            let curX = 0;
            let interval = setInterval(function () {
                if (songFinishTime > elapsedTime) {
                    elapsedTime = Date.now() - songTime;
                    if (replayWord) {
                        if (replayWord.totalTime > elapsedTime) {
                            // Put in conditions to make word grow bigger when time is close enough

                            //console.log(`${replayWord.word} is ${elapsedTime + replayWord.time} comparedto ${replayWord.totalTime - 4000}`);
                            // If currentTime 200 + wordSingingtime 100
                            if (elapsedTime + replayWord.time > replayWord.totalTime - 4000) {

                                //Positioning
                                if (curY >= rows) {
                                    curY = 0;
                                }
                                if (curX >= columns) {
                                    curX = 0;
                                    curY++;
                                }
                                let flashWord = document.createElement("p");
                                flashWord.classList.add("flashWord");
                                flashWord.innerHTML = replayWord.word;
                                flashWord.style.fontFamily = "Impact";
                                flashWord.style.position = "relative";
                                flashWord.style.top = "0px";
                                flashWord.style.left = curX * xUnit + 'px';
                                main.appendChild(flashWord);
                                setTimeout(function () { flashWord.parentNode.removeChild(flashWord); }, 10000);

                                //pop next word out
                                curX++;
                                replayWord = replayQueue.remove();
                            }



                        }
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









    document.addEventListener("keydown", function (event) {
        // console.log(event.which);
        if (songFI && (event.keyCode == 74 || event.keyCode == 70)) {
            if (keypressDowned === false) {

                // Starts the interval function for time bar
                progressBar = setInterval(frame, 10);
                function frame() {

                    if (progressBarWidth > 200){
                        elem.style.backgroundColor = "red";
                    }else if (progressBarWidth > 100){
                        elem.style.backgroundColor = "yellow";
                    }else{
                        elem.style.backgroundColor = "green";
                    }
                    elem.style.color = "#333";
                    progressBarWidth++;
                    elem.style.width = progressBarWidth % 100 + '%';
                    elem.innerHTML = progressBarWidth * 1;
                    

                }

                startTime = getTime();
                //console.log(`Start time is ${startTime}`);
                keypressDowned = true;

            }
        }
    }
    );

    document.addEventListener("keyup", function (event) {
        if (songFI  && (event.keyCode == 74 || event.keyCode == 70)) {
            clearInterval(progressBar);
            elem.style.color = "#333";
            progressBarWidth = 0;
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

            test.innerHTML = songQueue.printOutInOrder();

            // let node = document.createElement("li");    // Create a <li> node
            // node.innerHTML = `${song.word}: ${song.time}: ${song.totalTime}`;                      // Set node's text
            // wordList.insertBefore(node, wordList.firstChild);
            // if (wordList.childElementCount > 9) {
            //     wordList.removeChild(wordList.lastChild)
            // }
        }
    }
    );

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

    Queue.prototype.bottom = function () {
        return this.data[0];
    }


    Queue.prototype.size = function () {
        return this.data.length;
    }

}

