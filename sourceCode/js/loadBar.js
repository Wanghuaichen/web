/**
 * Created by sjliu on 2016-02-22.
 */
function LoadingBar(id)
{
    this.loadbar = $("#" + id);
    this.percentEle = $(".percent", this.loadbar);
    this.percentNumEle = $(".percentNum", this.loadbar);
    this.max = 100;
    this.currentProgress = 0;
}
LoadingBar.prototype = {
    constructor: LoadingBar,
    setMax: function (maxVal)
    {
        this.max = maxVal;
    },
    setProgress: function (val)
    {
        if (val >= this.max)
        {
            val = this.max;
        }
        this.currentProgress = parseInt((val / this.max) * 100) + "%";
        this.percentEle.width(this.currentProgress);
        this.percentNumEle.text(this.currentProgress);


    }
};
