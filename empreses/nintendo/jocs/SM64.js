const baile = document.getElementById("baile");
const mario = document.querySelector(".mariogif");  
const nobaile = document.getElementById("nobaile")

baile.addEventListener("click", () => {
    mario.classList.add("baile");   
});

nobaile.addEventListener("click", () => {
    mario.classList.remove("baile");   
});
