$slickSolution = false;
var $win = $(window);
function solSlider(){
    if($win.innerWidth() < 991){
        if(!$slickSolution){
            $(".b-joys, .b-components, .b-reviews").slick({
                dots: true,
                arrows: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: true,
                cssEase: 'linear',
                autoplay: true,
            });
            $(".b-factors").slick({
                dots: true,
                arrows: true,
                slidesToShow: 2,
                slidesToScroll: 2,
                autoplay: true,
            });
            $slickSolution = true;
        }
    } else if($win.innerWidth() >= 991){
        if($slickSolution){
            $('.b-joys, .b-factors, .b-components, .b-reviews').slick('unslick');
            $slickSolution = false;
        }
    }
}
function f_acc(){
    $('.b-accordion .acc-title').not($(this)).removeClass("active")
    $(this).toggleClass("active");
    $('.b-accordion .acc-text').not($(this).next()).slideUp(800);
    $(this).next().slideToggle(800);
}
$(function(){
    solSlider();
    $win.on('resize', function(){
        solSlider();
    });
    $('.b-accordion .acc-title').on('click', f_acc);

    if ($win.width() >= 991) {
        $(document).on('scroll', function () {

            scrollShow();
        });

    }
    let scrollShow = function () {

        let element = $('[data-unshow]'),
            scroll = $(document).scrollTop(),
            winHeight = $win.height();

        element.each(function () {
            let self = $(this),
                elementPos = self.offset().top;

            if (scroll >= (elementPos - (winHeight / 1.2))) {
                self.addClass('show')
            }
        });
    };
    $('a.btn').click(function(e){
        e.preventDefault();
        $("html, body").animate({scrollTop: $("#order_form").offset().top-300}, 1000);
        return false;
    });
});