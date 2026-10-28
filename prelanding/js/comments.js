const coments = Array.from(document.querySelectorAll(".coment"));
const placeComent = document.querySelector(".place-coment");

function showComent() {
    coments.forEach((elem) => {
        elem.style.display = "none";
    });

    placeComent.style.flexDirection = "column-reverse";

    let timeShow = 3000;
    coments.forEach((elem) => {
        setTimeout(() => {
            elem.style.display = "flex";
            elem.classList.add("animate-show");
            setTimeout(() => {
                elem.classList.remove("animate-show");
            }, 300);
        }, timeShow);
        timeShow = timeShow + 3000;
    });
}

showComent();

//Дата
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
}

const currentDate = new Date();
const elements = document.querySelectorAll(".date-now");
elements.forEach((element) => {
    element.textContent = formatDate(currentDate);
});

$("a[href$='#form-wrap']").on("touchend, click", function(e) {
    e.preventDefault();
    $('body,html').animate({
        scrollTop: $('#form-wrap').offset().top - 75
    }, 400);
});