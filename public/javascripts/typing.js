       
var i = 0;
var txt = ' Fully qualified driving instructor you can trust!'; /* The text */
var speed = 75; /* The speed/duration of the effect in milliseconds */

function typeWriter() {
    if (i < txt.length) {
        document.getElementById("demo").innerHTML += txt.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
    }
}
window.onload = typeWriter();