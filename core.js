function loadFunction() {
    updateRotation();
    countingNumbers();
    mapRemaining();
    eNumbers();
}

function rotation() {

}

function countingNumbers() {
    //nog te doen, maar dit moet de longtitude, en wat willekeurige data van andere schermen doen optellen/aftellen
    var format = d3.format(".4f");
    var lat = document.getElementById('latitude');
    var long = document.getElementById('longitude');

    d3.select("#latitude")
        .transition()
        .duration(3600000)
        .ease(d3.easeLinear)
        .tween("text", function () {
            var that = d3.select(this),
                i = d3.interpolateNumber(that.text().replace(/,/g, ""), '305');
            return function (t) {
                that
                    .text(format(i(t)));

            }
        });
    d3.select("#longitude")
        .transition()
        .duration(3600000)
        .ease(d3.easeLinear)
        .tween("text", function () {
            var that = d3.select(this),
                i = d3.interpolateNumber(that.text().replace(/,/g, ""), '-70');
            return function (t) {
                that
                    .text(format(i(t)));

            }
        });


}

function updateRotation() {
    //kies de hoek
    var degree = d3.randomUniform(-15, 15)();

    //tijd per transitie
    var time = 30000;
    d3.selectAll(".dynamicObject")
        .transition()
        .style("transform", "rotate(" + degree + "deg)")
        .style("transform-origin", "center")
        .duration(time);

    //aantal decimalen
    var format = d3.format(".2f");
    d3.selectAll("#distortionNumber")
        .transition()
        .duration(time)

        //interpoleerfunctie
        .tween("text", function () {
            var that = d3.select(this),
                i = d3.interpolateNumber(that.text().replace(/,/g, ""), degree);
            return function (t) {
                that.text(format(i(t)));
            };
        })
        .transition()
        .delay(time)

    //herhaling
    setTimeout(function () {
        updateRotation()
    }, time)
}

function mapRemaining() {
    var format = d3.format(".4f")
    d3.select("#remainingNumber")
        .transition()
        .duration(3600000)
        .ease(d3.easeLinear)
        .tween("text", function () {
            var that = d3.select(this),
                i = d3.interpolateNumber(that.text().replace(/,/g, ""), '42');
            return function (t) {
                that
                    .text(format(i(t)));

            }
        });
}

function eNumbers() {
    setTimeout(function () {
        var key = Math.floor(Math.random() * 4);
        if (key == 1) {
            d3.select('#log')
                .text("-3.3697452670e-1 1.8460165450e-1 -7.8480236960e-1");
            eNumbers();
        } else if(key == 2) {
            d3.select('#log')
                .text("2.3241277260e-2 3.9614969600e-1 1.7443745060e+0");
            eNumbers();
        } else if(key == 3) {
            d3.select('#log')
                .text("6.8458344910e-1-1.4336712180e-1 7.5946643080e-1");
            eNumbers();
        } else {
            setTimeout(function() {
                eNumbers();
            }, 2000)
        }
    }, 2000)

}
