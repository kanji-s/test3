console.log("main.js!!");

$(document).ready(() => {
  console.log("Ready!!");
});

// 大文字、小文字の英字、数字、ハイフンの正規表現パターン
const allowedCharactersPattern = /^[A-Za-z0-9\-]+$/;

$("#my_start").click(() => {
  console.log("Start!!");

  // Quagga
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.getElementById("my_quagga"),
    },
    decoder: {
      readers: ["code_128_reader", "ean_reader"],
    }
  }, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Initialization finished!!");
    Quagga.start();
  });

  Quagga.onProcessed((result) => {
    if (result == null) return;
    if (typeof result !== "object") return;
    if (result.boxes === undefined) return;
    const ctx = Quagga.canvas.ctx.overlay;
    const canvas = Quagga.canvas.dom.overlay;
    ctx.clearRect(0, 0, parseInt(canvas.width), parseInt(canvas.height));
    Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, ctx, { color: "blue", lineWidth: 5 });
  });

  Quagga.onDetected((result) => {
    const code = result.codeResult.code;
    if (allowedCharactersPattern.test(code)) {
      console.log("許可された文字セット内のバーコードが検出されました:", code);
      $("#my_result").text(code);
	  // ここで必要な処理を実行できます
    } else {
      console.log("許可された文字セット外のバーコードが検出されました:", code);
    }
  });
});

$("#my_stop").click(() => {
  console.log("Stop!!");
  Quagga.stop();
});
