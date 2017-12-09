let loadingRender = (function ($) {
    let $loadingBox = $(".loadingBox"),
        $run = $loadingBox.find(".run");

    //我们需要处理的图片
    let imgList = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png", "img/zf_teacher6.png", "img/zf_teacherTip.png"];


    let total = null,
        cur = null;
    //控制图片加载进度，计算滚动条加载长度
    let computed = function () {
        total = imgList.length;//所朋要加载的图片的总数
        cur = 0;
        imgList.forEach(function (item) {
            let tempImg = new Image;
            tempImg.src = item;
            tempImg.onload = function () {
                tempImg = null;
                cur++;//图片加完一张 宽度张点
                runFn();
            }
        });
    };

    //计算滚动条加载长度
    let runFn = function () {
        $run.css("width", cur / total * 100 + "%");
        if (cur >= total) {
            //需要延迟的图片都加载完成了：进入到下一个区域
            let delayTimer = setTimeout(() => {
                $loadingBox.remove();//先把当前区域在页面中干掉
                phoneRender.init();
                clearTimeout(delayTimer);
            }, 1500);//给个等待时间
            //设置一个缓冲等待时间，当加载完成，让用户看到加载完成的效果，再进入到下一个
        }
    };


    return {
        init: function () {
            $loadingBox.css("display", "block");
            computed();
        }
    }
})(Zepto);
// loadingRender.init();

let phoneRender = (function ($) {
    let $phoneBox = $(".phoneBox"),
        $time = $phoneBox.find(".time"),
        $listen = $phoneBox.find(".listen"),
        $listenTouch = $listen.find(".touch"),
        $detail = $phoneBox.find(".detail"),
        $detailTouch = $detail.find(".touch");

    let audioBell = $("#audioBell")[0],
        audioSay = $("#audioSay")[0];//转原生 用原生js来操作 因为audio的方法zepto没有


    let $phonePlan = $.Callbacks();

    //控制盒子的隐藏显示
    $phonePlan.add(function () {
        $listen.remove();
        $detail.css("transform", "translateY(0)");
    });

    //控制say播放
    $phonePlan.add(function () {
        audioBell.pause();
        audioSay.play();
        $time.css("display", "block");

        //随时计算播放时间
        let sayTimer = setInterval(() => {
            //获取总时间和已经播放的时间 单位是s
            let duration = audioSay.duration,
                current = audioSay.currentTime;

            let minute = Math.floor(current / 60);//算出分钟
            let second = Math.floor(current - minute * 60);//除了分钟以外剩下的值

            minute < 10 ? minute = "0" + minute : null;
            second < 10 ? second = "0" + second : null;

            $time.html(`${minute}:${second}`);

            //播放结束
            if (current >= duration) {
                clearInterval(sayTimer);
                enterNext();
            }
        }, 1000)
    });

    //detail-touch
    $phonePlan.add(() => $detailTouch.tap(enterNext));


    //进入下一个区域(message)
    let enterNext = function () {
        audioSay.pause();
        $phoneBox.remove();
        messageRender.init();

    };


    return {
        init: function () {
            $phoneBox.css("display", "block");

            //控制bell播放
            audioBell.play();

            /*LISTEN-TOUCH*/
            $listenTouch.tap($phonePlan.fire);
        }
    }
})(Zepto);

/*MESSAGE*/
let messageRender = (function ($) {
    let $messageBox = $(".messageBox"),
        $talkBox = $messageBox.find(".talkBox"),
        $talkList = $talkBox.find("li"),
        $keyBord = $messageBox.find(".keyBord"),
        $keyBordText = $keyBord.find("span"),
        $submit = $keyBord.find(".submit"),
        musicAudio = $("#musicAudio")[0];

    let $plan = $.Callbacks();

    //控制消息聊表逐条显示
    let step = -1,
        autoTimer = null,
        interval = 1500,
        offset = 0;
    $plan.add(() => {
        autoTimer = setInterval(() => {
            step++;//0 显示第一条
            let $cur = $talkList.eq(step);
            $cur.css({
                opacity: 1,
                transform: "translateY(0)"
            });

            //当第三条完全展示后 立即调取出键盘(step===2&&当前li显示的动画已经完成)
            if (step === 2) {
                $cur.one("transitionend", () => {//当前元素正在运行的动画完成
                    //one:JQ中事件绑定方法,想要实现当前事件只绑定一次,
                    // 触发一次后,给事件绑定的方法自动移除
                    $keyBord.css("transform", "translateY(0)").one("transitionend", textMove);//文字打印机效果
                });
                clearInterval(autoTimer);//暂时停下来
            }

            //从第五条开始，每当展示一个li 都需要让ul整体上移
            if (step >= 4) {
                offset += -$cur[0].offsetHeight;
                $talkBox.css(`transform`, `translateY(${offset}px)`);
            }

            //已经把li都显示了：技术动画，进入到下一个区域即可
            if (step >= $talkList.length - 1) {
                clearInterval(autoTimer);

                //进入到下一个环节之前给设置一个延迟，让用户把最后一条数据读完整
                let delayTimer = setTimeout(() => {
                    musicAudio.pause();
                    $messageBox.remove();
                    cubeRender.init();
                    clearTimeout(delayTimer);
                }, interval);
            }

        }, interval)//多长时间显示下一条
    });

    //控制文字及其打印机效果
    let textMove = function () {
        let text = $keyBordText.html();
        $keyBordText.css("display", "block").html("");
        let timer = null,
            n = -1;
        timer = setInterval(() => {
            if (n >= text.length) {
                //打印机效果完成：让发送按钮显示(并且给其绑定点击事件)
                clearInterval(timer);
                $keyBordText.html(text);
                $submit.css("display", "block").tap(() => {
                    $keyBordText.css("display", "none");
                    $keyBord.css("transform", "translateY(3.7rem)");
                    $plan.fire();//此时计划表中只有一个方法，重新通知计划表中的这个方法执行
                });
                return;
            }
            n++;
            $keyBordText[0].innerHTML += text.charAt(n);//如果索引没有的话也是空字符串 不是undefined
        }, 100)

    };


    return {
        init: function () {
            $messageBox.css("display", "block");
            musicAudio.play();
            $plan.fire();

        }
    }
})(Zepto);
// phoneRender.init();
// messageRender.init();

/*cube*/

//：只要在移动端浏览器中实现滑动操作，都需要把浏览器默认的滑动行为（例如：页卡切换等）禁止掉
$(document).on("touchstart touchove touchend", function (e) {
    e.preventDefault();
});

let cubeRender = (function () {
    let $cubeBox = $(".cubeBox"),
        $box = $cubeBox.find(".box");

    let touchBegin = function (e) {
        //this:box
        let point = e.changedTouches[0];
        $(this).attr({//自定义属性 它存的值 都是"字符串"
            strX: point.clientX,
            strY: point.clientY,
            isMove: false,
            changeX: 0,
            changeY: 0
        });
    };

    let touching = function (e) {
        let point = e.changedTouches[0],
            $this = $(this);//把原生对象转为JQ对象
        let changeX = point.clientX - parseFloat($this.attr("strX")),
            changeY = point.clientY - parseFloat($this.attr("strY"));
        if (Math.abs(changeX) > 10 || Math.abs(changeY) > 10) {
            $this.attr({
                isMove: true,
                changeX: changeX,
                changeY: changeY
            })
        }
    };

    let touchEnd = function (e) {
        let point = e.changedTouches[0],
            $this = $(this);
        let isMove = $this.attr("isMove"),
            changeX = parseFloat($this.attr("changeX")),
            changeY = parseFloat($this.attr("changeY")),
            rotateX = parseFloat($this.attr("rotateX")),
            rotateY = parseFloat($this.attr("rotateY"));
        if (isMove === "false") return;
        rotateX = rotateX - changeX / 3;//它俩是相反的
        rotateY = rotateY + changeY / 3;//除以3 是为了看到想要的效果
        $this.css(`transform`, `scale(.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`).attr({
            rotateX: rotateX,
            rotateY: rotateY
        })
    };

    return {
        init: function () {
            $cubeBox.css("display", "block");

            //绑定事件实现相关效果
            $box.attr({
                rotateX: -30,
                rotateY: 45,
            }).on({
                touchstart: touchBegin,
                touchmove: touching,
                touchend: touchEnd
            });

            //每一个页面的点击操作
            $box.find("li").tap(function () {
                $cubeBox.css("display", "none");
                let index = $(this).index();
                detailRender.init(index);
            });

        }
    }
})();
// cubeRender.init();


/*detail*/
let detailRender = (function () {
    let $detailBox = $(".detailBox"),
        $returnLink = $detailBox.find(".returnLink"),
        $cubeBox = $(".cubeBox"),
        swipeExample = null,
        $makisuBox = $("#makisuBox");

    let change = function (example) {//把当前初始化创建的实例传进去了 和swipeExample是一样的
        //example.activeIndex //当前活动块的索引
        //example.slides //数组，存储了当前所有活动块
        //example.slides[example.activeIndex] //当前活动块

        let {slides: slideAry, activeIndex} = example;

        //page1单独处理
        if (activeIndex === 0) {
            $makisuBox.makisu({
                selector: "dd",
                overlap: 0.8,
                speed: 0.7
            });
            $makisuBox.makisu("open");
        } else {
            $makisuBox.makisu({
                selector: "dd",
                overlap: 0,
                speed: 0
            });
            $makisuBox.makisu("close");
        }

        //给当前活动块设置id,其它块移除id
        [].forEach.call(slideAry,(item, index) => {
            if (index === activeIndex) {
                item.id = "page" + (activeIndex + 1);
                return;
            }
            item.id = null;
        })


    };


    return {
        init: function (index = 0) {
            $detailBox.css("display", "block");

            /*init swiper*/
            if (!swipeExample) {

                /*return*/
                $returnLink.tap(() => {
                    $detailBox.css("display", "none");
                    $cubeBox.css("display", "block");
                });

                //不存在实例的情况下 我们初始化 如果已经初始化过了 下一次直接运动到具体的位置即可 不需要重新初始化
                swipeExample = new Swiper(".swiper-container", {
                    effect: "coverflow",
                    onInit: change,
                    onTransitionEnd: change
                });

            }

            index = index > 5 ? 5 : index;
            swipeExample.slideTo(index, 0);
            //运动到指定索引的slide位置，第二个参数是speed,我们设置零是让其立即运动到指定位置

        }
    }
})();
cubeRender.init();
detailRender.init();



