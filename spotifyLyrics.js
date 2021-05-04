// @ts-check

// NAME: Spotify Lyrics
// AUTHOR: Darkempire
// DESCRIPTION: Display the current track lyrics.

/// <reference path="../globals.d.ts" />

(function spotifyLyrics() {
    if (!Spicetify.LocalStorage) {
        setTimeout(spotifyLyrics, 1000);
        return;
    }

    // Setup the mode
    let isEnabled = Spicetify.LocalStorage.get("lyrics") === "1";

    new Spicetify.Menu.Item("Lyrics Mode", isEnabled, (self) => {
        isEnabled = !isEnabled;
        Spicetify.LocalStorage.set("lyrics", isEnabled ? "1" : "0");
        self.setState(isEnabled);
    }).register();



    function createLyricsButton() {
        const b = document.createElement("button");
        b.classList.add("button");
        b.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3.979 15.045c-1.468.978-2.168 2.263-2.231 3.955h-1.748c.069-2.346 1.1-4.186 3.153-5.497l.826 1.542zm15.36-12.045c1.468 0 2.661 1.194 2.661 2.662 0 1.115-.651 2.238-2.085 2.521l-2.366-4.417c.63-.662 1.268-.766 1.79-.766zm0-2c-1.852 0-3.198.966-4.138 2.619l3.545 6.618c3.4.222 5.254-2.149 5.254-4.575 0-2.598-2.098-4.662-4.661-4.662zm-3.722 7.631l-7.418 2.977 6.602-4.5-.949-1.772-9.38 6.393 1.557 2.906 10.539-4.229-.951-1.775zm-6.38 6.87c.633.619.764 1.648.764 2.558v4.941h1.999v-5.097c0-1.776.662-3.024 1.735-4.207l-4.498 1.805z"/></svg>';
        b.id = "lyricsButton"
        b.style.width = "32px";
        b.onclick = () => {
            if (document.getElementById("LyricsContainer").style.display === "block") {
                closeNav();
            } else {
                openNav();
            }
        };
        return b;
    }

    // Create the lyrics buton
    const extraControlsContainer = document.getElementsByClassName("extra-controls-container");
    extraControlsContainer[0].prepend(createLyricsButton()); // prepend = append before all

    function createLyricsContainer() {
        const div = document.createElement("div");
        div.id = "LyricsContainer";
        div.style.display = "none";
        div.style.height = "100vh";
        div.style.width = "400px";
        div.style.position = "relative";
        div.style.padding = "20px";
        div.style.overflowY = 'auto';
        div.style.transition = "max-height 1000ms ease-in-out";
        
        // Append close button, title, artist, album, lyrics
        // Close Button
        const a = document.createElement("a");
        a.id = "LyricsContainerCloseButton";
        a.innerHTML = "&times;";
        a.onclick = () => {
            closeNav();
        }
        a.style.float = "right"
        a.style.top = "0";
        a.style.right = "25px";
        a.style.marginLeft = "100%";
        a.style.fontSize = "36px";
        // Music Title
        const h1 = document.createElement("h1");
        h1.id = "LyricsContainerMusicTitle"
        h1.innerHTML = "Title";
        // Music album / artist
        const h2 = document.createElement("h2");
        h2.id = "LyricsContainerMusicArtistAlbum"
        h2.innerHTML = "Artist";
        // Muisc Lyrics
        const p = document.createElement("p");
        p.id = "LyricsContainerMusicLyrics"
        p.innerHTML = "Lyrics";
        p.style.whiteSpace = "pre-line"; // Replace \n withs <br>
        
        div.appendChild(a);
        div.appendChild(h1);
        div.appendChild(h2);
        div.appendChild(p);
        
        return div;
    }

    // Create the lyrics container
    const contentWrapper = document.getElementById("content-wrapper");
    contentWrapper.appendChild(createLyricsContainer());

    // Lyrics container functions
    function openNav() {
        document.getElementById("LyricsContainer").style.display = "block";
    }
    function closeNav() {
        document.getElementById("LyricsContainer").style.display = "none";
    }

    // When the song changes
    Spicetify.Player.addEventListener("songchange", () => {
        if (!isEnabled) return;

        // Get data
        const data = Spicetify.Player.data

        const artist = data.track.metadata.artist_name
        const album = data.track.metadata.album_title
        const title = data.track.metadata.title

        // Display the title / artist / album
        document.getElementById("LyricsContainerMusicTitle").innerHTML = title
        document.getElementById("LyricsContainerMusicArtistAlbum").innerHTML = `by ${artist} in ${album}`

        // Find lyrics
        fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`).then(function(response) {
            response.text().then(function(text) {
                // Convert to json
                if (response.status === 200) {
                    const responseObject = JSON.parse(text);
                    if (responseObject.lyrics.length > 0) {
                        // Display the lyrics
                        document.getElementById("LyricsContainerMusicLyrics").innerHTML = responseObject.lyrics
                    } else {
                        document.getElementById("LyricsContainerMusicLyrics").innerHTML = "No lyrics found."
                    }
                } else {
                    document.getElementById("LyricsContainerMusicLyrics").innerHTML = "Request error."
                }
            });
        });
    });

    // Display the lyrics button and the lyrics container
    setInterval(() => {
        if (!isEnabled) {
            document.getElementById("LyricsContainer").style.display = "none";
            document.getElementById("lyricsButton").style.display = "none";
        } else {
            document.getElementById("lyricsButton").style.display = "block";
        }
    }, 500)

})();
