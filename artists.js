$(document).ready(function(){
    startSetup();
    var chosenSong;
    var json;
    var questionCounter;
    var answer;
    var jsonFilename = "";

    $(".genre").click(function(event){
        $("#songEmbed").show(); 
        questionCounter = 1;
        $("#questionNo").text(questionCounter);

        var newJsonFilename = "";
        switch (event.target.id){
            case "genrePop":
                newJsonFilename = "number1s.json";
                break;
            case "genreRnb":
                newJsonFilename = "rnb1s.json";
                break;
            case "genreCountry":
                newJsonFilename = "country1s.json";
                break;
            default:
                newJsonFilename = "main.json";
                break;  
        }
        //If different genre selected, update json accordingly
        if (newJsonFilename !== jsonFilename){
            jsonFilename = newJsonFilename;
            $.getJSON(jsonFilename, function(injson){
                json = injson;
                chosenSong = questionSetup(json);
                answer = chosenSong["artist"];
            });
        } else {
            chosenSong = questionSetup(json);
            answer = chosenSong["artist"];
        }
        $(".genre").hide();
    });

    $("#submitButton").click(function(){
        var checkedArtist = $("#a" + $('input[name = "artist"]:radio:checked').val()).text();
        showResult(checkedArtist, answer, chosenSong, json);
    });

    $("#nextSong").click(function(){
       if ($("#questionNo").text() === $("#questionMax").text()){
            showFinalScore();
       } else {
            chosenSong = questionSetup(json);
            answer = chosenSong["artist"];
            questionCounter++;
            $("#questionNo").text(questionCounter);
       }
    });

    $("#replayButton").click(function(){
        startSetup();
    });
});

function startSetup(){
    $("#maintitle").text("Top the Charts - Artists Edition");
    $("#subtitle").text("Make sure to turn up your sound!");
    $("#questionNo").text("0");
    $("#score").text("0");
    $("#rank").empty();
    $("#hiscore").text(getHighScore());
    $("#submitButton").hide();
    $("#nextSong").hide();
    $("#replayButton").hide();
    $("#songInfo").empty();
    $(".genre").show();
    $(".artistBubble").hide();
    $("#songEmbed").hide();
}

function questionSetup(json){
    $("#songInfo").empty();
    $("#submitButton").show();
    $("#nextSong").hide();
    $("#maintitle").text("Name the Artist");
    $("#subtitle").text("Choose one of the options below:");
    $(".artistBubble").show();
    var songTuple = getSong(json);
    embedYoutube(songTuple[0], false);
    populateChoices(songTuple[1]["artist"], songTuple[1]["year"], json);
    return songTuple[1];
}

function populateChoices(answer, year, json){
    var repeats = [];
    var artistVariance = [0, 1, 2, 12, 75];
    var isUsedPlace = new Array(artistVariance.length);
    for (var i = 0; i < isUsedPlace.length; i++) { isUsedPlace[i] = false; }
    var correctChoicePlace = Math.floor(Math.random() * (isUsedPlace.length + 1));
    $("#a" + String(correctChoicePlace)).html(answer + "<br />");
    isUsedPlace[correctChoicePlace] = true;
    repeats.push(answer);
    for (var i = 0; i < artistVariance.length; ++i){
        var currChoice = getArtistChoice(year, artistVariance[i], repeats, json);
        var currChoicePlace = Math.floor(Math.random() * (artistVariance.length - i));
        while (isUsedPlace[currChoicePlace] === true){
            currChoicePlace++;
            if (currChoicePlace > isUsedPlace.length) { currChoicePlace = 0; }
        }
        $("#a" + String(currChoicePlace)).html(currChoice + "<br />");
        isUsedPlace[currChoicePlace] = true;
        repeats.push(currChoice);
    }
}

function getArtistChoice(year, range, repeats, json){
    var possChoices = [];
    for (var i = 0; i < json["song"].length; i++) {
        if (Math.abs(year - json["song"][i]["year"]) <= range){
            possChoices.push(json["song"][i]);
        }
    }
    var artistChoice;
    var isRepeat = false;
    while (artistChoice === undefined || isRepeat === true){
        isRepeat = false;
        var artistChoice = possChoices[(Math.floor(Math.random() * 
                             possChoices.length))]["artist"];
        for (var i = 0; i < repeats.length; ++i){
            if (artistChoice === repeats[i]){ isRepeat = true; }
        }
    }
    return artistChoice;
}

function showResult(guess, answer, song, json){
    $("#submitButton").hide();
    $(".artistBubble").hide();
    $(".artistChoice").text("");
    $("#songInfo").text(song["artist"] + " - " + song["title"] +
                          " (" + song["year"] + ")");
    if (guess === answer){
        $("#maintitle").text("Great Job");
        $("#subtitle").text("+1 point");
        var currScore = parseInt($("#score").text());
        $("#score").text(String(currScore + 1));
        if (parseInt($("#score").text()) > parseInt($("#hiscore").text())){
            $("#hiscore").text(String(currScore + 1));
            setHighScore(currScore + 1);
        }
    } else {
        $("#maintitle").text("No Dice");
        $("#subtitle").text("+0 points");
    }
    embedYoutube("http://www.youtube.com/embed/" + song["vid"], true); 
    $("#nextSong").show();
}

function getSong(json){
    var chosenSong = json["song"][Math.floor(Math.random()*json["song"].length)];
    var songTime = chosenSong["vtime"].split(":");
    var startTime = Math.floor(((parseInt(songTime[0], 10) * 60) +
                      parseInt(songTime[1], 10)) * 0.38);
    var fullUrl = "http://www.youtube.com/embed/" + chosenSong["vid"] +
                    "?autoplay=1" + "&start=" + startTime + "&end=" + (startTime + 40);
    var urlSongTuple = [fullUrl, chosenSong];
    return urlSongTuple;
}

function embedYoutube(songUrl, isVisible) {
    //Remove any videos that are playing currently
    if ( $("#songEmbed").has("iframe")){
        ($("#songEmbed").children()).remove();
    }
    var ytEmbed = document.createElement("iframe");
    if (!isVisible){
        $("#songEmbed")[0].style.visibility = "hidden";
        ytEmbed.width = "0";
        ytEmbed.height = "0";
    } else {
        $("#songEmbed")[0].style.visibility = "visible";
        ytEmbed.width = "480";
        ytEmbed.height = "295";
    }
    ytEmbed.src = songUrl;
    $("#songEmbed")[0].appendChild(ytEmbed);
}

function showFinalScore() {
    $("#nextSong").hide();
    $("#maintitle").text("Your Final Score:");
    endScore = $("#score").text();
    possScore = String(parseInt($("#questionMax").text()));
    $("#subtitle").text(endScore + " out of " + possScore);
    $("#replayButton").show();
    var rank = parseInt(possScore) - parseInt(endScore) + 1;
    if (rank > 10 || rank < 0) { rank = 1; }
    $.getJSON("results.json", function(results){
        var resultSong = results["result"][rank];
        embedYoutube("http://www.youtube.com/embed/" + resultSong["vid"], true);
        $("#rank").html("<strong>Rank: " + resultSong["artist"] + "</strong>");
        var billboardLink = "http://www.billboard.com/articles/columns/chart-beat/" +
                              "5557800/hot-100-55th-anniversary-by-the-numbers-top" +
                              "-100-artists-most-no";
        $("#songInfo").html("<small>Artist ranking based on chart data from <a href=\"" +
                              billboardLink + "\">" + "Billboard's Hot 100 55th " +
                              "Anniversary Charts</a>.</small>");
    });
}

function setHighScore(hiscore){
    var expireLen = 2592000000; //30 days
    var expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + expireLen);
    document.cookie = "hsa=" + String(hiscore) + "; expires=" + expireDate.toGMTString();
}

function getHighScore(){
    var scoreStart = document.cookie.indexOf("hsa=") + 4;
    var scoreEnd = document.cookie.indexOf(";", scoreStart);
    if (scoreEnd === -1) { scoreEnd = document.cookie.length; }
    if (document.cookie.length === 0 || scoreStart === 3){ return 0; }
    var hiscore = parseInt(document.cookie.substring(scoreStart, scoreEnd));
    setHighScore(hiscore); //Refresh expiry date
    return hiscore;
}