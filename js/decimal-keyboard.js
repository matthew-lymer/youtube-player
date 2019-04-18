var previousButton = "",
    currentButton = "",
    keydepth = 1,
    key = "",
    waiting = false,
    wait,
    query;

$(document).ready(function(){
    $("#query").on("click", function(){
        $("#keypad").stop().animate({"bottom":"32px"}, 500);
    });

    $("#keypad .key.digit").on("click", function(){
        clearInterval(wait);
        currentButton = $(this).data("button");

        if(previousButton == currentButton){
            keydepth++;
            keydepth = Math.min(keydepth,4);
        }
        else{
            keydepth = 1;
            if(waiting == true){
                query = $("#query").val();
                $("#query").val(query + key);
            }
        }

        key = $(this).data("key" + keydepth);
        previousButton = currentButton;

        $("#keypad .key i").removeClass("on");
        $("#keypad .key[data-button='"+currentButton+"'] i").eq(keydepth-1).addClass("on");

        waiting = true;
        wait = setTimeout(function(){
            query = $("#query").val();
            $("#query").val(query + key);
            keydepth = 1;
            $("#keypad .key i").removeClass("on");
            waiting = false;
            previousButton = "";
        },500);
    });

    $("#keypad .key.clear").on("click", function(){
        clearInterval(wait);
        query = "";
        $("#query").val(query);
    });

    $("#keypad .key.backspace").on("click", function(){
        clearInterval(wait);
        query = $("#query").val();
        query = query.substring(0, query.length - 1);
        $("#query").val(query);
    });

    $("#keypad .key.space").on("click", function(){
        clearInterval(wait);
        query = $("#query").val() + " ";
        $("#query").val(query);
    });

    $("#keypad .key.done").on("click", function(){
        $("#keypad").stop().animate({"bottom":"-100%"}, 500);
        setTimeout(function(){
            $("#query").blur().trigger("searchYoutube");
        },500);
    });
});
